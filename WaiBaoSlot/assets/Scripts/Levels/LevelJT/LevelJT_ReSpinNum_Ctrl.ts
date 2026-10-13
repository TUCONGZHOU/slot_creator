import { _decorator, Component, Label, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';

@ccclass('LevelJT_ReSpinNum_Ctrl')
export class LevelJT_ReSpinNum_Ctrl extends UICtrl {

    protected initView(): void {
        
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
    public initUI( levelConfig:LevelConfig ):void{
        this.showReSpinNum();
    }

    public showReSpinNum():void {    
        // 显示ReSpin次数
        let reSpinData = LevelMgr.Instance.getLevelModel().getReSpin();
        let num = reSpinData ? reSpinData.reSpinCurCount : 0;
        this.view['ReNum'].getComponent(Label).string = num.toString();
    }

    public startRollSetNumScale():void{
        let reSpinData = LevelMgr.Instance.getLevelModel().getReSpin();
        let num = reSpinData ? reSpinData.reSpinCurCount : 0;
        num = num - 1;
        this.view['ReNum'].getComponent(Label).string = num.toString();
    }

}


