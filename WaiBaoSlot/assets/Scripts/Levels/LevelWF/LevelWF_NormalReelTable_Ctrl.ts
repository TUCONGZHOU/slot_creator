import { _decorator, assert, Component, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType, SymbolType } from '../../InterFace/LevelConfig';

@ccclass('LevelWF_NormalReelTable_Ctrl')
export class LevelWF_NormalReelTable_Ctrl extends BaseReelTable {

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
        //  先隐藏
        this.view["SpriteSplash"].active = false;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public addQuickEffect( col:number ):void {

    }

    public removeQuickEffect( col:number ):void {

    }


    // 播放bonus飞行动画
    public bonusFlyAction( col:number,row:number ){
        this.m_gameTableCompent.bonusFlyAction(col,row);
    }

    // 重写基类
    public checkNeedQuickRoll( viewSymbolData:number[][],col:number ):any {
        return false;
    }

    public playReelStopDoneSounds():void {
        let soundFile = this.m_levelConfig.SoundsFile["ReelStop"];
        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }

    // 当轮盘停止后 播放轮盘上所有bonus信号块的动画
    public playAllBonusFlyAction():void{
        let actionName = ""
        let reelData:number[][] = LevelMgr.Instance.getLevelModel().getSpinReelData()[this.m_reelTableIndex];
        assert( reelData != null," !! reelData is nil !! " )
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let onnColData = reelData[i];
            for (let j = 0; j < onnColData.length; j++) {
                let symbolId = onnColData[j];
                let config = LevelMgr.Instance.getSymbolConfig( symbolId ); 
                if ( config.type == SymbolType.BONUS ){
                    actionName = this.m_levelConfig.SymbolLineAction[symbolId.toString()];
                    if ( actionName != "" ){
                        this.bonusFlyAction( i,j );
                    }
                }
            }
        }
    }

    public getJackpotEndWorldPos():Vec3{
        const node = this.view["KuangBg"];
        return node ? node.worldPosition : new Vec3();
    }

    public setSpriteSplashVisible(visible:boolean): void {
        this.view["SpriteSplash"].active = visible;
    }

    public createRespinTips(index:number):void{
        let reSpinTip = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinTip"+index,Prefab);
        if(reSpinTip){
            let reSpinNode = instantiate(reSpinTip);
            this.view["RespinBetTipNode"].addChild(reSpinNode);
            reSpinNode.setPosition(new Vec3(0,0,0));
            reSpinNode.setScale(new Vec3(0.5,0.5,1));
            tween(reSpinNode)
            .to( 0.2, {scale: new Vec3(1, 1, 1)})
            .delay(0.6)
            .call(()=>{
                reSpinNode.destroy();
            })
            .start();
        }
    }
}


