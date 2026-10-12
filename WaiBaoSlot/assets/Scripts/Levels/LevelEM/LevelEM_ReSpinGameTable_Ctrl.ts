import { _decorator, Component, instantiate, Node, Prefab,sp,Vec3,tween } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameTable } from '../../GameBase/BaseGameTable';

import { ResMgr } from '../../Mgr/ResMgr';
import { LevelEM_Jackpot_Ctrl } from './LevelEM_Jackpot_Ctrl';
import { LevelEM_Wheel_Ctrl } from './LevelEM_Wheel_Ctrl';

@ccclass('LevelEM_ReSpinGameTable_Ctrl')
export class LevelEM_ReSpinGameTable_Ctrl extends BaseGameTable {

    private m_WheelCtrl:LevelEM_Wheel_Ctrl = null; 

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
        // JackpotTitle
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/JackpotTitle",Prefab);
        if(prefab){
            let jackpot = instantiate(prefab);
            this.view["NodeJackPot"].addChild(jackpot);
            const compent:LevelEM_Jackpot_Ctrl = jackpot.addComponent( LevelEM_Jackpot_Ctrl ) as LevelEM_Jackpot_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
        }
        // wheel
        let wheelPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/Wheel",Prefab);
        if(wheelPrefab){
            let wheel = instantiate(wheelPrefab);
            this.view["NodeWheel"].addChild(wheel);
            const compent:LevelEM_Wheel_Ctrl = wheel.addComponent( LevelEM_Wheel_Ctrl ) as LevelEM_Wheel_Ctrl;
            // 初始化组件
            compent.initUI( this.m_levelConfig );
            // 保存组件
            this.m_WheelCtrl = compent;
        }
    }

    public initLogicFunc():void {
        this.m_ListFunc.push( this.slotLineAction.bind(this) ); // -- 显示连线
        this.m_ListFunc.push( this.collectAction.bind(this) ); // -- 显示收集动画
        this.m_ListFunc.push( this.showAmountWin.bind(this) );  // -- 显示赢钱和大赢
        this.m_ListFunc.push( this.enterOtherGame.bind(this) );     // -- 触发 respin
    }

    // 显示连线
    public slotLineAction():void {
        this.excuteListFunc();
    }

    public collectAction():void {
        this.excuteListFunc();
    }

    public showAmountWin():void {
        this.excuteListFunc();
    }

    public enterOtherGame():void {
        this.excuteListFunc();
    }
}


