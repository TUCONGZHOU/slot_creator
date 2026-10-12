import { _decorator, Component, Node,tween,Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { BaseMutilReelUnit } from '../../GameBase/BaseMutilReelUnit';
import { Utils } from '../../Util/Utils';
import { BaseReelUnit } from '../../GameBase/BaseReelUnit';
import { LevelWF_Symbol_Ctrl } from "./LevelWF_Symbol_Ctrl";
import { ActionType,StoredIconStruct } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';

@ccclass('LevelWF_RespinReelUnit_Ctrl')
export class LevelWF_RespinReelUnit_Ctrl extends BaseMutilReelUnit {

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // 数字增长动画
    public bonusGrowUpAction( row:number,list:StoredIconStruct[] ):void{
        let reelUnit = this.getReelUnitCompent( row ) as BaseReelUnit;
        console.log("---------> bonusGrowUpAction row = ",row," list = ",list);
        let symbolNode = reelUnit.getSymbolNode( 0 );
        if ( symbolNode ){
            let symbolCompent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as LevelWF_Symbol_Ctrl;
            symbolCompent.playBonusGroupUpAction( list );
        }
    }

    public bonusGrowUpByResepinOver( row:number ):void{
        let reelUnit = this.getReelUnitCompent( row ) as BaseReelUnit;
        let symbolNode = reelUnit.getSymbolNode( 0 );
        if ( symbolNode ){
            // 缩放
            tween(symbolNode)
            .to( 0.3, {scale: new Vec3(1.2, 1.2, 1)})
            .to( 0.3, {scale: new Vec3(1, 1, 1)})
            .start();
            // 数字增长
            const bet = LevelMgr.Instance.getLevelModel().getBet();
            let storeData = LevelMgr.Instance.getLevelModel().getStoredCoin( this.m_reelTableIndex,this.m_reelUnitIndex,row );
            let multiple = storeData.Multiple;
            let startCoin = bet * multiple;
            let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
            let riseUpBet = respinInfo.riseUpBet;
            let endCoin = startCoin * riseUpBet;
            let symbolCompent = symbolNode.getComponent( this.m_levelConfig.BundleName +"_Symbol_Ctrl" ) as LevelWF_Symbol_Ctrl;
            symbolCompent.bonusGroupUpAction(startCoin,endCoin);
        }
    }

    // 重写基类当bonus信号块加载到轮盘的时候 播放的动画
    public playLoadBonusAction( compent:BaseReelUnit,symbolId:number ):void {
        if (symbolId == 94){
            let stopActionName = this.m_levelConfig.SymbolStopAction[symbolId.toString()];
            compent.playSymbolAction(0,stopActionName,true );
        }
    }

    public quickRunActionByReSpinOver( row:number,actionName:string,callBack:Function|null = null ):void{
        this.m_reelUnits[row].playSymbolAction( 0,actionName,false,false,callBack,5 );
    }

}


