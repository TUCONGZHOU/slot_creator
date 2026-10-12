import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseMutilReelUnit } from '../../GameBase/BaseMutilReelUnit';
import { BaseReelUnit } from '../../GameBase/BaseReelUnit';
import { Utils } from '../../Util/Utils';

@ccclass('LevelCK_RespinReelUnit_Ctrl')
export class LevelCK_RespinReelUnit_Ctrl extends BaseMutilReelUnit {

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // 重写基类
    public resetRollData( compent:BaseReelUnit ):void{
        let aa:number[] = [95,95,95,95,94,95,95,95,95,94]
        // let aa:number[] = [0,1,2,3,4,5,6,7,8,94]
        let rollData = [];
        for (let i = 0; i < 20; i++) {
            let index = Utils.randomInt(0,aa.length-1);
            rollData.push(aa[index]);
        }
        compent.resetRollData( rollData );
    }

    // 重写基类当bonus信号块加载到轮盘的时候 播放的动画
    public playLoadBonusAction( compent:BaseReelUnit,symbolId:number ):void {
        if (symbolId == 94){
            let lineActionName = this.m_levelConfig.SymbolStopAction[symbolId.toString()];
            compent.playSymbolAction(0,lineActionName,true );
        }
    }
}


