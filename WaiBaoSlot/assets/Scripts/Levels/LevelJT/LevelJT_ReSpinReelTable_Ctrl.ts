import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';

import { SymbolMgr } from '../../Mgr/SymbolMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelJT_RespinReelUnit_Ctrl } from './LevelJT_RespinReelUnit_Ctrl';
import { Utils } from '../../Util/Utils';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';


@ccclass('LevelJT_ReSpinReelTable_Ctrl')
export class LevelJT_ReSpinReelTable_Ctrl extends BaseReelTable {
    public m_reelUnitCompent:(LevelJT_RespinReelUnit_Ctrl) [] = [];
    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public playReelStopDoneSounds():void {
        // let soundFile = this.m_levelConfig.SoundsFile["BonusStop"];
        // SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }

    public getSymbolNode(tableNum: number, endCol: number, endRow: number) {
        this.m_gameTableCompent[tableNum].getSymbolNode( endCol,endRow )
    }

    // 信号块播放数字增长动画
    public playBonusNumAction( addMult:number,col:number,row:number,id:number ):void{

        let stopActionName = this.m_levelConfig.SymbolStopAction[id.toString()];
        if ( stopActionName != null && stopActionName != "" ){
            let action = LevelMgr.Instance.getLevelModel().getAction();
            if ((id == 94 || id == 95 || id == 96) && action == ActionType.RESPIN ){
                this.playSymbolAction( col,row,stopActionName,false );
            }else{
                this.playSymbolAction( col,row,stopActionName,false );
            }
        }
        // 上面的数字滚动
        let compent = this.getReelUnitCompent( col ) as LevelJT_RespinReelUnit_Ctrl;
        compent.bonusGrowUpAction(row,addMult);

        // 数字滚动的音效
        let soundFile1 = this.m_levelConfig.SoundsFile["CoinIncrease"];
        if (soundFile1){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile1,1,false );
        }
    }
}


