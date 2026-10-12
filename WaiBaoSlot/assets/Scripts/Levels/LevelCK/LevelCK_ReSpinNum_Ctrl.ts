import { _decorator, Component, Label, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';

@ccclass('LevelCK_ReSpinNum_Ctrl')
export class LevelCK_ReSpinNum_Ctrl extends UICtrl {

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
        this.setReNumScale( num );
    }

    public startRollSetNumScale():void{
        let reSpinData = LevelMgr.Instance.getLevelModel().getReSpin();
        let num = reSpinData ? reSpinData.reSpinCurCount : 0;
        num = num - 1;
        this.setReNumScale( num );
    }

    public setReNumScale( num:number ):void{
        this.view["ReNumBg1/ReNum1"].setScale(new Vec3(0.8, 0.8, 1));
        this.view["ReNumBg1/ReNum2"].setScale(new Vec3(0.8, 0.8, 1));
        this.view["ReNumBg1/ReNum3"].setScale(new Vec3(0.8, 0.8, 1));

        if (num == 1) {
            this.view["ReNumBg1/ReNum1"].setScale(new Vec3(1, 1, 1));
        }
        else if (num == 2) {
            this.view["ReNumBg1/ReNum2"].setScale(new Vec3(1, 1, 1));
        }
        else if (num == 3) {
            this.view["ReNumBg1/ReNum3"].setScale(new Vec3(1, 1, 1));
        }
    }
}


