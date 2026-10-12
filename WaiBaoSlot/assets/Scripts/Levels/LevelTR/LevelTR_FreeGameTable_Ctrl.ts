import { _decorator, Component, Node,Prefab,instantiate, Vec3, tween, sp } from 'cc';
const { ccclass, property } = _decorator;


import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelTR_Jackpot_Ctrl } from './LevelTR_Jackpot_Ctrl';
import { Utils } from '../../Util/Utils';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelTR_FreeGameTable_Ctrl')
export class LevelTR_FreeGameTable_Ctrl extends BaseGameTable {

    public m_curShowWinNum:number = 0; // 当前显示的赢钱金额

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
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelTR_Jackpot_Ctrl = jackpot.addComponent( LevelTR_Jackpot_Ctrl ) as LevelTR_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.stopBigWin.bind(this) );     // -- 点击停止按钮 结束大赢的动画显示
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
            const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
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
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            this.m_curShowWinNum = 0;
            this.m_gameMainCompent.enterNormal();
        }else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }

    public wildFlyAction( col:number,row:number ){
        // 播放spine动画
        this.m_gameMainCompent.wildFlyAction( col,row );
    }
}


