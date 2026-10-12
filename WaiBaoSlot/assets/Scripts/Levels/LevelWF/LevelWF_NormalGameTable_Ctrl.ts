import { _decorator, Component, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { ResMgr } from '../../Mgr/ResMgr';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { UILayer } from '../../Mgr/UIMgr';
import { Utils } from '../../Util/Utils';
import { LevelWF_Jackpot_Ctrl } from './LevelWF_Jackpot_Ctrl';
import { LevelWF_YuanBaoSpine_Ctrl } from './LevelWF_YuanBaoSpine_Ctrl';
import { LevelWF_NormalReelTable_Ctrl } from './LevelWF_NormalReelTable_Ctrl';

@ccclass('LevelWF_NormalGameTable_Ctrl')
export class LevelWF_NormalGameTable_Ctrl extends BaseGameTable {

    private m_yuanbaoCtrl:LevelWF_YuanBaoSpine_Ctrl = null;

    protected initView(): void {
        super.initView();
        GlEventMgr.Instance.on(EventName.StopBigWinAction, this.stopBigWinAction, this);
    }


    start() {
        super.start();
        this.view["SpOverMoney"].active = false;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public createOtherUI():void{
        let prefab2 = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/YuanBaoSpine",Prefab);
        if(prefab2){
            let jackpot = instantiate(prefab2);
            this.view["SpNode"].addChild(jackpot);
            const compent:LevelWF_YuanBaoSpine_Ctrl = jackpot.addComponent( LevelWF_YuanBaoSpine_Ctrl ) as LevelWF_YuanBaoSpine_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );

            this.m_yuanbaoCtrl = compent;
        }

        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelWF_Jackpot_Ctrl = jackpot.addComponent( LevelWF_Jackpot_Ctrl ) as LevelWF_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发 respin
    }


    // 显示连线
    public slotLineAction() {
        this.playGameTableLineAction();

        // 同时播放bonus飞行动画 
        (this.getReelTableCompent(0) as LevelWF_NormalReelTable_Ctrl).playAllBonusFlyAction();

        this.excuteListFunc();
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let multiple = winNum / bet;
        if ( multiple >= 20 ){
            // 播放音效
            let soundFile = this.m_levelConfig.SoundsFile["CoinIncreaseBig"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }
            // -- 发送消息 bottom显示赢钱
            GlEventMgr.Instance.emit(EventName.ShowAmount,false);
        }else {
            // 播放音效
            if( winNum > 0){
                let soundFile = this.m_levelConfig.SoundsFile["CoinIncrease"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
                // -- 发送消息 bottom显示赢钱
                GlEventMgr.Instance.emit(EventName.ShowAmount,false);
            }
        }

        // 下一步
        Utils.performWithDelay(this.node,()=>{
            this.excuteListFunc();
        },1)
    }

    // 触发respin
    public enterOtherGame() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (nextAction == ActionType.RESPIN){
            this.m_gameMainCompent.enterReSpin();
        }
        else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }

    public bonusFlyAction( col:number,row:number ){
        let coinPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/CoinFly",Prefab);
        if(coinPrefab){
            let coinNode = instantiate(coinPrefab);
            this.view["CoinNode"].addChild(coinNode);

            // 起始位置
            let worldPos = this.getSymbolWorldPos( 0,col,row );
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.view["CoinNode"].inverseTransformPoint(localPos,worldPos);
            coinNode.position = localPos;
            coinNode.scale = new Vec3(0.1,0.1,1);
            let time = 0.8;
            let endWorldPos = this.view["CoinNode"].worldPosition.clone();

            // 飞行的音效
            let soundFile = this.m_levelConfig.SoundsFile["CoinFly"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            
            tween(coinNode)
            .parallel(
                Utils.jumpTo(coinNode, time, endWorldPos, 300),
                tween(coinNode).to(time, { scale: new Vec3(0.3, 0.5, 1) })
            )
            .delay(0.1)
            .call(() => {
                coinNode.destroy();
                // 播放spine
                this.m_yuanbaoCtrl.playCoinAction();
                // 播放音效
                let soundFile = this.m_levelConfig.SoundsFile["CoinDrop2"];
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            })
            .start();
        }
    }

    public playYuanBaoEnterRepinAaction( callBack:Function ):void {
        if (this.m_yuanbaoCtrl){
            this.m_yuanbaoCtrl.playYuanBaoEnterRepinAaction(callBack);
        }
    }

    public getYuanBaoNodeWorldPos(index:number):Vec3{
        if (this.m_yuanbaoCtrl){
            return this.m_yuanbaoCtrl.getNodeWorldPos(index);
        }
        return new Vec3();
    }

    public getJackpotEndWorldPos():Vec3{
        let reelTable = this.getReelTableCompent(0) as LevelWF_NormalReelTable_Ctrl;
        if (reelTable){
            return reelTable.getJackpotEndWorldPos();
        }
        return new Vec3();
    }

    public setSpriteSplashVisible( visible:boolean):void{
        let reelTable = this.getReelTableCompent(0) as LevelWF_NormalReelTable_Ctrl;
        if (reelTable){
            reelTable.setSpriteSplashVisible( visible );
        }
    }

    // 从respin切换到normal 播放bigWin
    public playBigWinAmountAction():void{
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["BigWin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        // 播放动画
        this.view["SpOverMoney"].active = true;
        // 发送消息 金币滚动
        GlEventMgr.Instance.emit( EventName.StartAmountScroll,0,winNum,15 );
        // 发送消息增长进度条
        GlEventMgr.Instance.emit( EventName.StartProgressBarAnim, 0, 1, 15,"ShowSpinBtn" );
    }

    public stopBigWinAction() {
        // 停止音效
        let soundFile = this.m_levelConfig.SoundsFile["BigWin"];
        if (soundFile){
            SoundMgr.Instance.stopSoundByPath(soundFile);
        }
        // 隐藏动画
        this.view["SpOverMoney"].active = false;
        // 发送消息 停止进度条滚动和数字增长动画
        GlEventMgr.Instance.emit(EventName.StopProgressBarAnim);
    }

}
