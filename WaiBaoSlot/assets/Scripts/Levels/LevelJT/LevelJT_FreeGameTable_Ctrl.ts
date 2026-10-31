import { _decorator, Component, Node,Prefab,instantiate, Vec3, tween, sp } from 'cc';
const { ccclass, property } = _decorator;


import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelJT_Jackpot_Ctrl } from './LevelJT_Jackpot_Ctrl';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelJT_FreeJackpot_Ctrl } from './LevelJT_FreeJackpot_Ctrl';
import { UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelJT_FreeWinCtrl } from './LevelJT_FreeWinCtrl';
import { LevelJT_GameModel } from './LevelJT_GameModel';
import { LevelJT_MainUI_Ctrl } from './LevelJT_MainUI_Ctrl';

@ccclass('LevelJT_FreeGameTable_Ctrl')
export class LevelJT_FreeGameTable_Ctrl extends BaseGameTable {

    public m_curShowWinNum:number = 0; // 当前显示的赢钱金额
    public m_jackpotCompent:LevelJT_FreeJackpot_Ctrl;
    public m_freeWinCtrl:LevelJT_FreeWinCtrl;

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
        this.view["SpOverMoney"].active = false;
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }
    
    public createOtherUI():void{
        // jsckpot
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FreeJockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelJT_FreeJackpot_Ctrl = jackpot.addComponent( LevelJT_FreeJackpot_Ctrl ) as LevelJT_FreeJackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_jackpotCompent = compent;
        }
    }
    public resetJackpotTitle(){
        if (!this.m_jackpotCompent || !this.m_jackpotCompent.node.isValid){
            return
        }
        this.m_jackpotCompent.resetJackpotTitle()
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.bonusFlyAction.bind(this) ); // -- 收集bonus
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.stopBigWin.bind(this) );     // -- 点击停止按钮 结束大赢的动画显示
        this.m_ListFunc.push( this.showOverView.bind(this) );     // -- 结算界面
        this.m_ListFunc.push( this.showFreespinOverLayer.bind(this) );     // -- freeSpin结束
        this.m_ListFunc.push( this.stopBigWin.bind(this) );     // -- 点击停止按钮 结束大赢的动画显示
        this.m_ListFunc.push( this.enterOtherGame.bind(this) ); // -- 切回normal
    }

    // 显示连线
    public slotLineAction() {
        this.playGameTableLineAction();

        Utils.performWithDelay(this.node,()=>{
            this.excuteListFunc();
        },1)
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        // -- 发送消息 bottom显示赢钱
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let diffNum = winNum - this.m_curShowWinNum;
        let multiple = diffNum / bet;
        // 设置
        this.m_curShowWinNum = winNum;
        if ( multiple >= 20 ){
            // 显示大赢
            this.showBigOrMagaWin( diffNum );
        }else {
            // -- 发送消息 bottom显示赢钱
            GlEventMgr.Instance.emit(EventName.ShowAmount);
            this.excuteListFunc();
        }
    }

    // 重写基类 显示bigWin
    public showBigOrMagaWin(diffNum: number):void{
        // 播放音效
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["FreeSpinWin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 播放动画
        this.view["SpOverMoney"].active = true;
        // 发送消息 金币滚动
        GlEventMgr.Instance.emit( EventName.StartAmountScroll,0,diffNum,15 );
        // 发送消息增长进度条
        GlEventMgr.Instance.emit( EventName.StartProgressBarAnim, 0, 1, 15,"ExeListFunc" );

        // 执行 this.excuteListFunc(); 的下一步 需要等待点击btn_stop按钮
        this.m_bigWinMark = true;
    }

    public stopBigWin() {
        // 停止音效
        if (this.m_bigWinMark){
            this.m_bigWinMark = false;  
            let soundFile = this.m_levelConfig.SoundsFile["FreeSpinWin"];
            // 停止音效
            if (soundFile){
                SoundMgr.Instance.stopSoundByPath(soundFile);
            }
            // 隐藏动画
            this.view["SpOverMoney"].active = false;
            // 发送消息 停止进度条滚动
            GlEventMgr.Instance.emit(EventName.StopProgressBarAnim);
        }
        // 下一步
        this.excuteListFunc();
    }

    public showFreespinOverLayer() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            // 播放音效
            // 音效
            let soundFile = this.m_levelConfig.SoundsFile["FreeSpinWin"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }
            // 播放动画
            this.view["SpOverMoney"].active = true;
            // 发送消息 金币滚动
            const winNum = (LevelMgr.Instance.getLevelModel() as LevelJT_GameModel).getBonusWinAmount();
            GlEventMgr.Instance.emit( EventName.StartAmountScroll,0,winNum,30 );
            // 发送消息增长进度条
            GlEventMgr.Instance.emit( EventName.StartProgressBarAnim, 0, 1, 30,"ExeListFunc" );
            // 执行 this.excuteListFunc(); 的下一步 需要等待点击btn_stop按钮
            this.m_bigWinMark = true;
        }else {
            this.excuteListFunc();
        }
    }

    public enterOtherGame() {
        if (this.m_freeWinCtrl && this.m_freeWinCtrl.node){
            this.m_freeWinCtrl.node.removeFromParent();
            this.m_freeWinCtrl.node.destroy();
            this.m_freeWinCtrl = null;
        }
        
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            this.m_curShowWinNum = 0;
            GlEventMgr.Instance.emit(EventName.StopProgressBarAnim);
            // 发送消息 有些轮盘需要停止大赢动画
            GlEventMgr.Instance.emit(EventName.StopBigWinAction);
            this.m_gameMainCompent.enterNormal();
        }else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
            // GlEventMgr.Instance.emit( EventName.StartRoll )
            
        }
    }

    public bonusFlyAction( col:number,row:number ){
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action != 'FREESPIN'){
            // 下一步
            this.excuteListFunc();
            return
        }
        let reelData = LevelMgr.Instance.getLevelModel().getSpinReelData();
        let bonusData = [];
        let bonusIndex:number = 0;
        for (let i = 0; i < reelData.length; i++){
            let table = reelData[i]
            for (let j = 0;j < table.length; j++){
                let reel = table[j]
                for (let k = 0;k < reel.length; k++){
                    if (reel[k] == 94 || reel[k] == 95 || reel[k] == 96 ){
                        bonusData.push({row:k,col:j,id:reel[k]})
                        // 播放spine动画
                        bonusIndex++;
                        (this.m_gameMainCompent as LevelJT_MainUI_Ctrl).newBonusFlyAction( j,k,bonusIndex );
                    } else if (reel[k] == 100){
                        // 增加次数

                    }
                }
            }
        }
        
        let delayTime = bonusIndex * 1;
        Utils.performWithDelay(this.node,()=>{
            this.excuteListFunc();
        },delayTime)
    }

    // freeGame结算
    public showOverView(){
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            if (this.m_jackpotCompent && this.m_jackpotCompent.node.isValid){
                this.m_jackpotCompent.node.removeFromParent();
                this.m_jackpotCompent.node.destroy();
                this.m_jackpotCompent = null;
            }
            

            // this.m_freeWinCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/FreeWinView","LevelJT_FreeWinCtrl",UILayer.Normal) as LevelJT_FreeWinCtrl;
            // this.m_freeWinCtrl.initUI( this.m_levelConfig );
            Utils.performWithDelay(this.node,()=>{
                // if (this.m_freeWinCtrl && this.m_freeWinCtrl.node){
                //     this.m_freeWinCtrl.node.removeFromParent();
                //     this.m_freeWinCtrl.node.destroy();
                //     this.m_freeWinCtrl = null;
                // }
                this.excuteListFunc();
            },1.5)

            let prefab = ResMgr.Instance.getAsset("LevelJT","Prefabs/FreeWinView",Prefab);
            if(prefab){
                let freeWinNode = instantiate(prefab);
                this.node.addChild(freeWinNode);
                this.m_freeWinCtrl = freeWinNode.addComponent( LevelJT_FreeWinCtrl ) as LevelJT_FreeWinCtrl;
                // 初始化组件
                this.m_freeWinCtrl.initUI( this.m_levelConfig );
            }
        }else {
            this.excuteListFunc();
        }
    }
}


