import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';

@ccclass('LevelF_NormalGameTable_Ctrl')
export class LevelF_NormalGameTable_Ctrl extends BaseGameTable {
    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public initLogicFunc() {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.showBigWin.bind(this) );     // -- 显示大赢
        this.m_ListFunc.push( this.recoverSpinBtn.bind(this) ); // -- 恢复Spin按钮
    }

    // 显示连线
    public slotLineAction() {
        console.log("-------------> slotLineAction");
        this.playGameTableLineAction();
        this.excuteListFunc();
    }

    // 显示赢钱和大赢
    public showAmountWin() {
        console.log("-------------> showAmountWin");
        // -- 发送消息 bottom显示赢钱
        GlEventMgr.Instance.emit(EventName.ShowAmount);
        this.excuteListFunc();
    }

    // 显示大赢
    public showBigWin() {
        console.log("-------------> showBigWin");
        this.excuteListFunc();
    }

    // 恢复Spin按钮
    public recoverSpinBtn() {
        this.excuteListFunc();
    }

}


