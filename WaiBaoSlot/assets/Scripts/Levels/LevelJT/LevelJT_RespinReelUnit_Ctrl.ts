import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseMutilReelUnit } from '../../GameBase/BaseMutilReelUnit';
import { BaseReelUnit } from '../../GameBase/BaseReelUnit';
import { Utils } from '../../Util/Utils';
import { LevelJT_Symbol_Ctrl } from './LevelJT_Symbol_Ctrl';
import { LevelJT_ReSpinGameTable_Ctrl } from './LevelJT_ReSpinGameTable_Ctrl';
import { LevelJT_FreeReelTable_Ctrl } from './LevelJT_FreeReelTable_Ctrl';
import { LevelJT_ReSpinReelTable_Ctrl } from './LevelJT_ReSpinReelTable_Ctrl';

@ccclass('LevelJT_RespinReelUnit_Ctrl')
export class LevelJT_RespinReelUnit_Ctrl extends BaseMutilReelUnit {

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
            compent.playSymbolAction(0,lineActionName,false );
        }
    }

    // 数字增长动画
    public bonusGrowUpAction( row:number,addMult:number ):void{
        let reelUnit = this.getReelUnitCompent( row ) as BaseReelUnit;
        let symbolNode = reelUnit.getSymbolNode( 0 );
        if ( symbolNode ){
            let symbolCompent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as LevelJT_Symbol_Ctrl;
            symbolCompent.addBonusNum( addMult );
        }
    }
    public getNextBonusSoundNumById( id ){
        return (this.m_reelTableCompent as LevelJT_ReSpinReelTable_Ctrl).getNextBonusSoundNumById( id )
    }
}


