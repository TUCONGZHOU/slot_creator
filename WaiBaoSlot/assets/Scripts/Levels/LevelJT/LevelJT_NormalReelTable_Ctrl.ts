import { _decorator, Component, Node,Vec3,AnimationClip,Animation,assetManager,AudioClip } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';

import { BaseReelTable } from '../../GameBase/BaseReelTable';

import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelJT_NormalReelTable_Ctrl')
export class LevelJT_NormalReelTable_Ctrl extends BaseReelTable {

    public m_quickMetaBg:any[] = []; // 记录快滚
    public m_quickMeta:any[] = []; // 记录快滚

    public m_redBounsSoundIndex:number = 0 // 每次spin，红色bonus落地音效序号 
    public m_goldBounsSoundIndex:number = 0 // 每次spin，红色bonus落地音效序号
    public m_greenBounsSoundIndex:number = 0 // 每次spin，红色bonus落地音效序号

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public addQuickEffect( col:number ):void {
        if ( this.m_quickMetaBg[col] != null ){
            return
        }
        // 添加背景快滚
        let meta = SymbolMgr.Instance.getEffectNodeByName("quickRunBg");
        meta.node.parent = this.view["Mermaid_reel"+col];
        meta.node.active = true;
        meta.node.position = new Vec3(0,0,0);
        let animation = meta.node.getChildByName("Mermaid_reel_1_00000").getComponent(Animation);
        animation.play(meta.config.actionName);
        animation.getState(meta.config.actionName).wrapMode = AnimationClip.WrapMode.Loop; // 设置循环播放
        // 保存
        this.m_quickMetaBg[col] = meta

        // 添加快滚
        let cmeta = SymbolMgr.Instance.getEffectNodeByName("quickRun");
        cmeta.node.parent = this.view["Mermaid_reel"+col].parent;
        cmeta.node.active = true;
        let position = this.view["Mermaid_reel"+col].position;
        cmeta.node.position = new Vec3(position.x,position.y,position.z);
        let canimation = cmeta.node.getChildByName("WinFrameMermaid_run_01").getComponent(Animation);
        canimation.play(cmeta.config.actionName);
        canimation.getState(cmeta.config.actionName).wrapMode = AnimationClip.WrapMode.Loop; // 设置循环播放
        // 保存
        this.m_quickMeta[col] = cmeta
    }

    public removeQuickEffect( col:number ):void {
        if ( this.m_quickMetaBg[col] != null ){
            let meta = this.m_quickMetaBg[col];
            let animation = meta.node.getChildByName("Mermaid_reel_1_00000").getComponent(Animation);
            // 停止动画
            animation.stop();
            // 归还信号块
            SymbolMgr.Instance.resetEffectNodeUnUsed( meta );
            // 清空
            this.m_quickMetaBg[col] = null;
        }
        
        if ( this.m_quickMeta[col] != null ){
            let meta = this.m_quickMeta[col];
            let animation = meta.node.getChildByName("WinFrameMermaid_run_01").getComponent(Animation);
            // 停止动画
            animation.stop();
            // 归还信号块
            SymbolMgr.Instance.resetEffectNodeUnUsed( meta );
            // 清空
            this.m_quickMeta[col] = null;
        }
    }

    public playReelStopDoneSounds():void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }

    public startRoll():void {
        this.m_redBounsSoundIndex = 0;
        this.m_goldBounsSoundIndex = 0;
        this.m_greenBounsSoundIndex = 0;
        super.startRoll();
    }
    public getNextBonusSoundNumById( id ){
        if (id == 94){
            return ++this.m_redBounsSoundIndex;
        }else if(id == 95){
            return ++this.m_goldBounsSoundIndex;
        }else if(id == 96){
            return ++this.m_greenBounsSoundIndex;
        }
    }

}


