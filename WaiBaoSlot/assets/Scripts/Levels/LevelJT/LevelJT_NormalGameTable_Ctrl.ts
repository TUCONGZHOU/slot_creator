import { _decorator, Component, Node,Prefab,instantiate,Vec3,tween,Tween,math,sp } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { ResMgr } from '../../Mgr/ResMgr';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelJT_Jackpot_Ctrl } from './LevelJT_Jackpot_Ctrl';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { UILayer,UIMgr,UICtrl } from '../../Mgr/UIMgr';
import { Utils } from '../../Util/Utils';
import { LevelJT_Choose_Ctrl } from './LevelJT_Choose_Ctrl';


@ccclass('LevelJT_NormalGameTable_Ctrl')
export class LevelJT_NormalGameTable_Ctrl extends BaseGameTable {

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
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelJT_Jackpot_Ctrl = jackpot.addComponent( LevelJT_Jackpot_Ctrl ) as LevelJT_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.wildFlyAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.stopBigWin.bind(this) );     // -- 点击停止按钮 结束大赢的动画显示
        this.m_ListFunc.push( this.chooseOtherGame.bind(this) );     // -- 触发 选择
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发 freespin
    }

    // 显示连线
    public slotLineAction() {
        this.playGameTableLineAction();
        this.excuteListFunc();
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let multiple = winNum / bet;
        if ( multiple >= 20 ){
            // 显示大赢
            this.showBigOrMagaWin();
        }else {
            // -- 发送消息 bottom显示赢钱
            GlEventMgr.Instance.emit(EventName.ShowAmount,true);
            this.excuteListFunc();
        }
    }

    // 重写基类 显示bigWin
    public showBigOrMagaWin():void{
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["FreeSpinWin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 播放动画
        this.view["SpOverMoney"].active = true;
        // 发送消息 金币滚动
        const winAmount = LevelMgr.Instance.getLevelModel().getWinAmount();
        GlEventMgr.Instance.emit( EventName.StartAmountScroll,0,winAmount,15 );
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
    // 选择特殊玩法
    public chooseOtherGame(){
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action != 'NORMAL'){
            // 下一步
            this.excuteListFunc();
            return
        }
        let reelData = LevelMgr.Instance.getLevelModel().getReelData();

        let num = 0
        let bonusData = [];
        for (let i = 0; i < reelData.length; i++){
            let table = reelData[i]
            for (let j = 0;j < table.length; j++){
                let reel = table[j]
                for (let k = 0;k < reel.length; k++){
                    if (reel[k] == 94){
                        num++
                        bonusData.push({row:k,col:j,id:reel[k]})
                    } 
                }
            }
        }
        if (num < 6){
            // 下一步
            this.excuteListFunc();
            return
        }

        let soundFile = this.m_levelConfig.SoundsFile["CollectBonusToFeature"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
        }
        Utils.performWithDelay(this.node,()=>{
            let compent = UIMgr.Instance.showUi(this.m_abName,"Prefabs/ChooseLayer","LevelJT_Choose_Ctrl",UILayer.Popup) as LevelJT_Choose_Ctrl;
            compent.initUI(this.m_levelConfig);
            // 
            let delayTime = 0.5
            let flyTime = 0.15
            for (let i = 0; i < num; i++){
                let index = i
                let reelUnitCompent = this.m_reelTableCompent[0].getReelUnitCompent(bonusData[i].col)
                // let symbolNode = reelUnitCompent.get
                let worldPos = reelUnitCompent.getSymbolWorldPos(bonusData[i].row)
                let storeData = LevelMgr.Instance.getLevelModel().getStoredCoin( 0,bonusData[i].col,bonusData[i].row );
                let multiple = storeData.Multiple;
                // let labelNode = this.m_reelTableCompent:cloneBonusLebel()
                Utils.performWithDelay(this.node,()=>{
                    compent.flyAddMult(multiple,bonusData,worldPos,flyTime,index)
                },i*delayTime)
            }
            Utils.performWithDelay(this.node,()=>{
                compent.showAll()
            },delayTime * num + delayTime + flyTime )
        },2 )
    }
    // 触发freespin
    public enterOtherGame() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (nextAction == ActionType.FREESPIN){
            this.m_gameMainCompent.enterFreeSpin();
        }
        else if (nextAction == ActionType.BONUS){
            Utils.performWithDelay(this.node,()=>{
                this.m_gameMainCompent.enterBonus();
            },1)
        }
        else if (nextAction == ActionType.RESPIN){
           this.m_gameMainCompent.enterReSpin();
        }
        else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }

    public wildFlyAction( col:number,row:number ){
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action != 'NORMAL'){
            // 下一步
            this.excuteListFunc();
            return
        }
        let reelData = LevelMgr.Instance.getLevelModel().getReelData();
        let wildData = [];
        for (let i = 0; i < reelData.length; i++){
            let table = reelData[i]
            for (let j = 0;j < table.length; j++){
                let reel = table[j]
                for (let k = 0;k < reel.length; k++){
                    if (reel[k] == 92){
                        wildData.push({row:k,col:j,id:reel[k]})
                        // 播放spine动画
                        this.m_gameMainCompent.wildFlyAction( j,k );
                    } 
                }
            }
        }
        let delayTime = wildData.length > 0 ? 1:0
        Utils.performWithDelay(this.node,()=>{
            this.excuteListFunc();
        },delayTime)
    }
}


