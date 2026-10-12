import { _decorator, Component, Node,instantiate ,Prefab,tween,sp} from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelCK_Jackpot_Ctrl } from './LevelCK_Jackpot_Ctrl';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelCK_FreeSpinView_Ctrl } from './LevelCK_FreeSpinView_Ctrl';
import { LevelCK_NormalReelTable_Ctrl } from './LevelCK_NormalReelTable_Ctrl';


@ccclass('LevelCK_NormalGameTable_Ctrl')
export class LevelCK_NormalGameTable_Ctrl extends BaseGameTable {
    
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
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JockpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelCK_Jackpot_Ctrl = jackpot.addComponent( LevelCK_Jackpot_Ctrl ) as LevelCK_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
    }



    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.showBigWin.bind(this) );     // -- 显示大赢
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发 freespin 或者 respin
    }

    // 显示连线
    public slotLineAction() {
        this.playGameTableLineAction();
        this.excuteListFunc();
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        // -- 发送消息 bottom显示赢钱
        GlEventMgr.Instance.emit(EventName.ShowAmount,true);
        this.excuteListFunc();
    }

    // 显示大赢
    public showBigWin() {
        this.showBigOrMagaWin(2,()=>{
            this.excuteListFunc();
        })
    }

    // 触发freespin 或者 respin
    public enterOtherGame() {
        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (nextAction == ActionType.FREESPIN){
            this.m_gameMainCompent.enterFreeSpin();
        }
        else if ( nextAction == ActionType.RESPIN ){
            this.m_gameMainCompent.enterReSpin();
        }
        else {
            // 恢复点击
            GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        }
    }
}


