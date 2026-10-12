import { _decorator, Component, Node,Prefab,instantiate, tween, sp } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelCK_Jackpot_Ctrl } from './LevelCK_Jackpot_Ctrl';
import { LevelCK_FreeNumNode_Ctrl } from './LevelCK_FreeNumNode_Ctrl';
import { EventName } from '../../Mgr/EventName';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelCK_FreeSpinOver_Ctrl } from './LevelCK_FreeSpinOver_Ctrl';
import { LevelCK_FreeSpinOver2_Ctrl } from "./LevelCK_FreeSpinOver2_Ctrl"
import { SoundMgr } from '../../Mgr/SoundMgr';
import { Utils } from '../../Util/Utils';

@ccclass('LevelCK_FreeGameTable_Ctrl')
export class LevelCK_FreeGameTable_Ctrl extends BaseGameTable {

    private m_freeComponent1:LevelCK_FreeNumNode_Ctrl = null;
    private m_freeComponent2:LevelCK_FreeNumNode_Ctrl = null;

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
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
            const compent:LevelCK_Jackpot_Ctrl = jackpot.addComponent( LevelCK_Jackpot_Ctrl ) as LevelCK_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
        // freeNum1
        let prefab1 = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FreeNumNode",Prefab);
        if(prefab1){
            let nodeCount1 = instantiate(prefab1);
            this.view["NodeCount1"].addChild(nodeCount1);
            const compent:LevelCK_FreeNumNode_Ctrl = nodeCount1.addComponent( LevelCK_FreeNumNode_Ctrl ) as LevelCK_FreeNumNode_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_freeComponent1 = compent;
        }

        // freeNum2
        let prefab2 = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FreeNumNode",Prefab);
        if(prefab2){
            let nodeCount2 = instantiate(prefab2);
            this.view["NodeCount2"].addChild(nodeCount2);
            const compent:LevelCK_FreeNumNode_Ctrl = nodeCount2.addComponent( LevelCK_FreeNumNode_Ctrl ) as LevelCK_FreeNumNode_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            this.m_freeComponent2 = compent;
        }

        this.setFreeNum();
    }

    public setFreeNum():void{
        let freeInfo = LevelMgr.Instance.getLevelModel().getFreeSpinInfo();
        let num2 = freeInfo.freeSpinsLeftCount;
        let num1 = freeInfo.freeSpinsTotalCount - num2;

        if(this.m_freeComponent1){
            this.m_freeComponent1.setFreeNum(num1);
        }
        if(this.m_freeComponent2){
            this.m_freeComponent2.setFreeNum(num2);
        }
    }
    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.showBigWin.bind(this) );     // -- 显示大赢
        this.m_ListFunc.push( this.showFreespinOverLayer.bind(this) );     // -- freeSpin结束
        this.m_ListFunc.push( this.enterOtherGame.bind(this) ); // -- 切回normal
    }

    // 显示连线
    public slotLineAction() {
        this.playGameTableLineAction();

        // 设置次数
        this.setFreeNum();
        Utils.performWithDelay(this.node,()=>{
            this.excuteListFunc();
        },1)
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        // -- 发送消息 bottom显示赢钱
        GlEventMgr.Instance.emit(EventName.ShowAmount,false);
        this.excuteListFunc();
    }

    // 显示大赢
    public showBigWin() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            this.showBigOrMagaWin(2,()=>{
                this.excuteListFunc();
            })
        }else {
            this.excuteListFunc();
        }
    }

    public showFreespinOverLayer() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            // 显示freespin结束的界面
            const anims: Array<ReturnType<typeof tween>> = [];
            let freeSpinCtrl:LevelCK_FreeSpinOver_Ctrl = null;
            anims.push(
                tween(this.node).delay(0.5)
            );
            anims.push(
                tween(this.node).call(()=>{
                    // -- 音效
                    let winCount = LevelMgr.Instance.getLevelModel().getWinAmount();
                    let soundFile = this.m_levelConfig.SoundsFile["Congrats"];
                    if (soundFile && winCount > 0){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                    // 显示freespin界面
                    freeSpinCtrl = UIMgr.Instance.showUi("LevelCK","Prefabs/FreeSpinOver","LevelCK_FreeSpinOver_Ctrl",UILayer.Normal) as LevelCK_FreeSpinOver_Ctrl;
                    freeSpinCtrl.initUI();
                })
            );
            anims.push(
                tween(this.node).delay(2)
            );
            anims.push(
                tween(this.node).call(()=>{
                    // 关闭freespin界面
                    UIMgr.Instance.closeUi("LevelCK_FreeSpinOver_Ctrl");
                    // 播放音效
                    let soundFile = this.m_levelConfig.SoundsFile["FreeSpinOver"];
                    if (soundFile){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                    this.excuteListFunc();
                })
            );
            tween(this.node).sequence(...anims).start();
        }else {
            this.excuteListFunc();
        }
    }

    public enterOtherGame() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.FREESPIN && nextAction == ActionType.NORMAL) {
            // // 显示freespin界面
            // let freeSpinCtrl:LevelCK_FreeSpinOver2_Ctrl = UIMgr.Instance.showUi("LevelCK","Prefabs/FreeSpinOver2",LevelCK_FreeSpinOver2_Ctrl,UILayer.Normal) as LevelCK_FreeSpinOver2_Ctrl;
            // freeSpinCtrl.initUI(()=>{
            //     // 进入normal
            //     this.m_gameMainCompent.enterNormal();
            // });

            // 进入normal
            this.m_gameMainCompent.enterNormal();
        }else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }
}


