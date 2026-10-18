import { _decorator, Component, Node, sp,instantiate,Prefab, Vec3, UIOpacity, tween, utils, Tween } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelJT_Jackpot_Ctrl } from './LevelJT_Jackpot_Ctrl';
import { ResMgr } from '../../Mgr/ResMgr';
import { ActionType, LevelConfig } from '../../InterFace/LevelConfig';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { EventName } from '../../Mgr/EventName';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { LevelJT_BonusOverView_Ctrl } from './LevelJT_BonusOverView_Ctrl';
import { LevelJT_BonusNode_Ctrl } from './LevelJT_BonusNode_Ctrl';

export interface BonusWinNodeState {
    Name: string;
    Node: Node;
};

@ccclass('LevelJT_BonusStartView_Ctrl')
export class LevelJT_BonusStartView_Ctrl extends UICtrl {

    public m_levelConfig:LevelConfig = null;
    public m_index:number = -1;

    public m_winNode:BonusWinNodeState[] = [];
    public m_bonusNodes:Node[] = [];
    public m_endPosList:Vec3[] = [];

    m_canTouch: boolean = false;

    protected initView(): void {
        // 添加监听
        GlEventMgr.Instance.on(EventName.View_LevelSpin_bonus, this.responseBonusSpin, this);

        for( let i = 1; i <= 12; i++ ){
            this.addButtonClick("bonusNode" + i, this, ()=> this.clickSpin(i));
            this.addBonusNode( i );
        }
    }
    public addBonusNode( id:number ){
        let prefab = ResMgr.Instance.getAsset("LevelJT","Prefabs/BonusNode",Prefab);
        let bonusInfo = LevelMgr.Instance.getLevelModel().getBonus();
        
        if(prefab){
            let bonusNode = instantiate(prefab);
            this.node.addChild(bonusNode);
            const compent:LevelJT_BonusNode_Ctrl = bonusNode.addComponent( LevelJT_BonusNode_Ctrl ) as LevelJT_BonusNode_Ctrl;
            let pos:Vec3 = this.view["bonusNode" + id].position
            bonusNode.position = pos;
            this.m_endPosList.push( pos );
            let spine = compent.view['skeleton'].getComponent(sp.Skeleton) as sp.Skeleton;
            spine.setAnimation(0, "Game4-idle", true);
            this.m_bonusNodes.push(bonusNode);
            // jackpot
            let has = false;
            let data;
            for (let info of bonusInfo){
                if (id == info.id){
                    has = true;
                    data = info;
                    break;
                }
            }
            if ( !has ){
                return;
            }
            // 初始化组件
            compent.initUI( data );
            // 存入节点
            let meta:BonusWinNodeState = {
                Name: data.type,
                Node: bonusNode
            };
            this.m_winNode.push( meta )
        }
        
    }

    start()
    {
        let bonusInfo = LevelMgr.Instance.getLevelModel().getBonus();
        if (bonusInfo.length == 0 ){
            let startPos = this.view['SpineWan'].position
            let endPosList:Vec3[] = [];
            for (let i = 0; i < this.m_bonusNodes.length; i++){
                let index = i;
                let curNode = this.m_bonusNodes[index]
                let endPos = curNode.position.clone();
                endPosList.push( endPos )

                const jumpHeight = 120;
                const midPos = new Vec3(
                    (startPos.x + endPos.x)/2,
                    Math.max(startPos.y, endPos.y) + jumpHeight,
                    0
                );

                // 【重点】直接链式写sequence，不要数组push tween实例！
                tween(curNode)
                    .call(()=>{
                        curNode.position = startPos;
                        let spine = curNode.getChildByName("skeleton").getComponent(sp.Skeleton) as sp.Skeleton;
                        spine.setAnimation(0, "Game4-FZjinbi", true);
                        curNode.scale = new Vec3(0,0,1)
                    })
                    .delay(index * 0.15)
                    .to(0.2, {position: midPos,scale:new Vec3(0.3,0.3,1)}, {easing: "quadOut"}) // 上升
                    .to(0.3, {position: endPosList[index],scale:new Vec3(1,1,1)}, {easing: "quadIn"})  // 下落
                    .call(()=>{
                        let spine = curNode.getChildByName("skeleton").getComponent(sp.Skeleton) as sp.Skeleton;
                        spine.setAnimation(0, "Game4-idle", true);
                        // 最后一个金币落地才解锁触摸
                        if(index === this.m_bonusNodes.length -1)
                        {
                            this.m_canTouch = true;
                            this.setButtonZOrderUp()
                        }
                    })
                    .start();
            }
        }else{
            this.m_canTouch = true;
            this.setButtonZOrderUp()
        }
    }
    public setButtonZOrderUp(){
        for( let i = 1; i <= 12; i++ ){
            this.view["bonusNode" + i].setSiblingIndex( 100 );
        }
    }

    // 收到回复消息
    public responseBonusSpin():void
    {
        // let spineNode = this.m_bonusNodes[this.m_index]
        // let spine = spineNode.getChildByName("skeleton").getComponent(sp.Skeleton) as sp.Skeleton;
        // if (spine) {
        //     spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
        //         spine.setCompleteListener(null); // 清除监听器
        //         spineNode.active = false; // 隐藏当前的spine节点
        //     });
        //     spine.setAnimation(0, "Game4-FZjinbi", false);

            // Utils.performWithDelay(this.node,()=>{  
                // // 添加spine
                this.showBonusChange();
                
            // },0.3); 

            // bonus出现音效
            let soundFile = this.m_levelConfig.SoundsFile["Bonus"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
            }
        // }
    }

    public initUI(levelConfig:LevelConfig): void{
        this.m_levelConfig = levelConfig;
        // 创建
        this.createOtherUI();
    }

    public createOtherUI():void{
        // let prefab = ResMgr.Instance.getAsset("LevelJT","Prefabs/JockpotTitle",Prefab);
        // if(prefab){
        //     let jackpot = instantiate(prefab);
        //     this.view["NodeJackPot"].addChild(jackpot);
        //     const compent:LevelJT_Jackpot_Ctrl = jackpot.addComponent( LevelJT_Jackpot_Ctrl ) as LevelJT_Jackpot_Ctrl;
        //     // 初始化组件
        //     compent.initUI( this.m_levelConfig );
        // }
    }

    update(deltaTime: number) {
        
    }

    public clickSpin(i: number)
    {
        if (this.m_canTouch == false){
            return
        }
        if (this.m_index == -1) {
            this.m_index = i;
            // -- 请求数据
            LevelMgr.Instance.requestSpin();
        }
    }

    public showBonusChange():void
    {
        let bonusInfo = LevelMgr.Instance.getLevelModel().getBonus();
        // 取最后一个元素
        let info = bonusInfo[bonusInfo.length - 1];
        let bonusNode = this.m_bonusNodes[this.m_index - 1]

        // 存入节点
        let meta:BonusWinNodeState = {
            Name: info.type,
            Node: bonusNode
        };
        this.m_winNode.push(meta);

        
        let compent = bonusNode.getComponent(LevelJT_BonusNode_Ctrl) as LevelJT_BonusNode_Ctrl
        
        tween(bonusNode)
            .call(()=>{
                // bonusNode.scale = new Vec3(0,1,1); // 设置初始缩放
            })
            // .delay(index * 0.15)
            .to(0.5, {scale:new Vec3(0,1,1)}) // 
            .call(()=>{
                compent.resetUI( info )
            })
            .to(0.5, {scale:new Vec3(1,1,1)})  // 
            .call(()=>{
                // 判断是否结束
                let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
                if (nextAction == ActionType.NORMAL){
                    // 结束了
                    this.bonusOver();
                }else 
                {
                    // 重置
                    this.m_index = -1;
                }
            })
            .start();
        
    }

    public bonusOver():void{
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["BonusWin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
        }

        // 从 this.m_winNode 找出 Grand Major Minor Mini 的节点 显示飞出动画    
        let grandNode:Node[] = [];
        let majorNode:Node[] = [];
        let minorNode:Node[] = [];
        let miniNode:Node[] = [];
        for( const meta of this.m_winNode ){
            if (meta.Name == "Grand"){
                grandNode.push(meta.Node);
            }else if (meta.Name == "Major"){
                majorNode.push(meta.Node);
            }else if (meta.Name == "Major"){
                minorNode.push(meta.Node);
            }else if (meta.Name == "Mini"){
                miniNode.push(meta.Node);
            }
        }

        let targetName: string = "";           // 对应的名称（Grand/Major等）
        let guangName: string = "";             // 对应的光效名称
        let targetArray: Node[] | null = null; // 最终找到的数组
        // 依次判断哪个数组长度等于3
        if (grandNode.length === 3) {
            targetArray = grandNode;
            targetName = "Grand";
        } else if (majorNode.length === 3) {
            targetArray = majorNode;
            targetName = "Major";
        } else if (minorNode.length === 3) {
            targetArray = minorNode;
            targetName = "Minor";
        } else if (miniNode.length === 3) {
            targetArray = miniNode;
            targetName = "Mini";
        }
        let prefab = ResMgr.Instance.getAsset("LevelJT","Prefabs/BonusOverView",Prefab);
        if(prefab){
            let bonusOverNode = instantiate(prefab);
            this.node.addChild(bonusOverNode);
            bonusOverNode.setSiblingIndex( 200 );
            const compent:LevelJT_BonusOverView_Ctrl = bonusOverNode.addComponent( LevelJT_BonusOverView_Ctrl ) as LevelJT_BonusOverView_Ctrl;
            compent.initUI( this.m_levelConfig,targetName,this );
        }
 

            // // 显示bonusover界面
            // let bonusOverSpinCtrl = UIMgr.Instance.showUi(this.m_levelConfig.BundleName,"Prefabs/BonusOverView","LevelJT_BonusWinView_Ctrl",UILayer.Normal) as LevelJT_BonusOverView_Ctrl;
            // bonusOverSpinCtrl.initUI( this.m_levelConfig,targetName );

    }
    public closeUI(){
        this.node.removeFromParent();
        this.node.destroy();
    }
    
}


