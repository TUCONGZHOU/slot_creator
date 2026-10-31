import { _decorator, Component, Node,find,instantiate, Prefab,assert,Vec3,Tween,sp,Animation,animation } from 'cc';

import { ResMgr } from './ResMgr';
import { LevelConfig,EffectConfig } from '../InterFace/LevelConfig';
import { BaseSymbolUnit } from '../GameBase/BaseSymbolUnit';

const { ccclass, property } = _decorator;

export class SymbolMgr extends Component {
    
    public static Instance:SymbolMgr = null;

    private curNum:number = 0;    // 加载信号块的当前数量
    private totalNum:number = 0;  // 加载信号块的所有数量
    private m_levelConfig:LevelConfig = null;

    private symbolMap:Map<number,Array<any>>; // 信号块
    private effectMap:Map<string,Array<any>>; // 特效
    private effectConfigMap:Map<string,Array<EffectConfig>>; // 特效配置


    protected onLoad(): void {
        if( SymbolMgr.Instance === null ){
            SymbolMgr.Instance = this;
        }
        else{
            this.destroy();
            return;
        }
    }

    protected onDestroy(): void {
        if (SymbolMgr.Instance === this) {
            SymbolMgr.Instance = null;
        }
    }

    start() {
        // 初始化
        this.symbolMap = new Map();
        this.effectMap = new Map();
        this.effectConfigMap = new Map();
    }

    update(deltaTime: number) {
        
    }

    public initSymbolCache( jsonData:LevelConfig,progressFunc:Function,endFunc:Function ):void{
        this.m_levelConfig = jsonData;
        let cancvs = find("Canvas");
        let cacheNode:Node = cancvs.getChildByName("SymbolCacheNode");
        if (cacheNode == null){
            cacheNode = new Node("SymbolCacheNode");
            cancvs.addChild( cacheNode );
        }
        cacheNode.active = false; //隐藏该节点

        this.curNum = 0;
        this.totalNum = 0;

        // 信号块
        let symbol = jsonData.Symbol
        for (const key in symbol) {
            this.totalNum += symbol[key].count; // 总进度
        }

        // 特效
        let effect = jsonData.Effect;
        for ( const value of effect ){
            this.totalNum += value.count; // 总进度
        }

        // 开始创建信号块
        for (const key in symbol) {
            let count = symbol[key].count;
            // 加载信号块
            for (let index = 0; index < count; index++) {
                this.createSymbolNodeById( symbol[key].id );
                this.curNum += 1;
                // 调用进度
                progressFunc(this.curNum,this.totalNum);
                if (this.curNum >= this.totalNum){
                    endFunc();
                }
            }
        }

        // 开始创建effect
        for ( const value of effect ){
            let count = value.count;
            // 加载特效
            for (let index = 0; index < count; index++) {
                if ( value.file != "" ) {
                    this.createEffectNodeByConfig( value );
                    // 存储一下配置
                    this.effectConfigMap[value.name] = value;
                }

                this.curNum += 1;
                // 调用进度
                progressFunc(this.curNum,this.totalNum);
                if (this.curNum >= this.totalNum){
                    endFunc();
                }
            }
        }
    }

    // 创建一个信号块
    public createSymbolNodeById( symbolId:number ):any{
        let symbol = this.m_levelConfig.Symbol;
        let cancvs = find("Canvas");
        let cacheNode:Node = cancvs.getChildByName("SymbolCacheNode");
        for (const key in symbol) {
            let id = symbol[key].id;
            if (id == symbolId){
                if (this.symbolMap[id] == null){
                    this.symbolMap[id] = [];
                }
                let lengthIndex = this.symbolMap[id].length;
                let file = symbol[key].file;
                let prefab = ResMgr.Instance.getAsset(this.m_levelConfig.BundleName,file,Prefab);
                if(prefab){
                    let symbol_ui = instantiate(prefab);
                    if( symbol_ui ){
                        cacheNode.addChild( symbol_ui );
                        symbol_ui.active = false;
                        let meta:any = {};
                        meta.id = id;
                        meta.node = symbol_ui;
                        meta.used = false;
                        meta.index = lengthIndex;
                        meta.config = symbol[key];
                        this.symbolMap[id].push( meta );
                        return meta
                    }
                }else{
                    assert( false," 创建信号块出错 file = "+ file);
                }
            }
        }
    }

    // 创建一个特效
    public createEffectNodeByConfig( effectConfig:EffectConfig ):any {
        let cancvs = find("Canvas");
        let cacheNode:Node = cancvs.getChildByName("SymbolCacheNode");
        if (this.effectMap[effectConfig.name] == null){
            this.effectMap[effectConfig.name] = [];
        }
        let lengthIndex = this.effectMap[effectConfig.name].length;
        let file = effectConfig.file;
        if (file && file != ""){
            let prefab = ResMgr.Instance.getAsset(this.m_levelConfig.BundleName,file,Prefab);
            if(prefab){
                let effect_ui = instantiate(prefab);
                if( effect_ui ){
                    cacheNode.addChild( effect_ui );
                    effect_ui.active = false;
                    let meta:any = {};
                    meta.name = effectConfig.name;
                    meta.node = effect_ui;
                    meta.used = false;
                    meta.index = lengthIndex;
                    meta.config = effectConfig;
                    this.effectMap[effectConfig.name].push( meta );
                    return meta
                }
            }
        }
    }

    // 获取信号块
    public getSymbolNodeById(id:number):any {
        // 找出有没有没有被占用的node
        if( this.symbolMap[id] !== null ){
            let length = this.symbolMap[id].length;
            for( let i = 0;i < length;i++ ){
                let meta = this.symbolMap[id][i];
                if (meta.used == false){
                    this.cleanupMetaBeforeUse(meta);
                    meta.used = true;
                    return meta
                }
            }
        }
        // 全部被占用 则创建新的 然后取出最后一个给外面用
        let meta = this.createSymbolNodeById( id );
        this.cleanupMetaBeforeUse(meta);
        meta.used = true
        return meta;
    }

    // 获取特效
    public getEffectNodeByName( name:string ):any {
        assert( name != null," !! 创建特效出现错误 name 是 null "  );
        assert( name != ""," !! 创建特效出现错误 name 是空 "  );
        if( this.effectMap[name] !== null ){
            let length = this.effectMap[name].length;
            for( let i = 0;i < length;i++ ){
                let meta = this.effectMap[name][i];
                if (meta.used == false){
                    this.cleanupMetaBeforeUse(meta);
                    meta.used = true;
                    return meta
                }
            }
        }
        // 全部被占用 则创建新的 然后取出最后一个给外面用
        let effect = this.m_levelConfig.Effect;
        for( const config of effect ){
            if ( config.name == name ){
                let meta:any = this.createEffectNodeByConfig( config );
                this.cleanupMetaBeforeUse(meta);
                meta.used = true;
                return meta;
            }
        }
        assert( false," !! 创建特效出现错误 name = " + name );        
    }

    // 获取特效配置
    public getEffectConfigByName( name:string ):EffectConfig{
        return this.effectConfigMap[name]
    }

    // 归还信号块
    public resetSymbolNodeUnUsed( meta:any ):void {
        assert( meta != null," !! resetEffectNodeUnUsed meta 不能为null !! " );
        this.symbolMap[meta.id][meta.index].node.removeFromParent();
        let cancvs = find("Canvas");
        let cacheNode:Node = cancvs.getChildByName("SymbolCacheNode");
        this.symbolMap[meta.id][meta.index].used = false;
        this.symbolMap[meta.id][meta.index].node.active = false;
        this.symbolMap[meta.id][meta.index].node.parent = cacheNode;
        this.symbolMap[meta.id][meta.index].node.position = new Vec3( 0,0,0);
        // TODO 停止动画 
    }

    private cleanupMetaBeforeUse(meta: any) {
        if (!meta.node) return;
        meta.node.removeFromParent();
        meta.node.active = false;
        const skeleton = meta.node.getComponent(sp.Skeleton);
        if (skeleton) {
            skeleton.clearTracks();
            skeleton.setToSetupPose();
        }
        const animation = meta.node.getComponent(Animation);
        if (animation) {
            animation.stop();
            // 强制回到第 0 帧（第一帧）
            const state = animation.getState(animation.currentClip?.name || "");
            if (state) {
                state.time = 0;
            }
        }
        Tween.stopAllByTarget(meta.node);
    }


    // 归还特效
    public resetEffectNodeUnUsed( meta:any ):void{
        assert( meta != null," !! resetSymbolNodeUnUsed meta 不能为null !! " );
        this.effectMap[meta.name][meta.index].node.removeFromParent();
        let cancvs = find("Canvas");
        let cacheNode:Node = cancvs.getChildByName("SymbolCacheNode");
        this.effectMap[meta.name][meta.index].used = false;
        this.effectMap[meta.name][meta.index].node.active = false;
        this.effectMap[meta.name][meta.index].node.parent = cacheNode;
    }

    public clearAllSymbol():void{
        let cancvs = find("Canvas");
        let cacheNode:Node = cancvs.getChildByName("SymbolCacheNode");
        if (cacheNode !== null){
            cacheNode.destroy();
        }

        this.symbolMap = null;
        this.effectMap = null;
    }
}


