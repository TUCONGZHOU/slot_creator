import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';
import { ActionType, SymbolRollData, SymbolViewType } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelCK_Symbol_Ctrl')
export class LevelCK_Symbol_Ctrl extends BaseSymbolUnit {
    
    protected initView(): void {
        super.initView();
    }
    
    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public loadLogicDataUI( data:SymbolRollData ):void {
        if( data.id == 94 )
        {
            if( data.posType && data.posType == SymbolViewType.View )
            {
                let row = data.row;
                if (this.m_viewRow != -1) {
                    row = this.m_viewRow;
                }
                let storeData = LevelMgr.Instance.getLevelModel().getStoredCoin( this.m_reelTableIndex,data.col,row );
                let multiple = storeData.Multiple;
                this.setBonusCountUI( multiple );

            }
            else 
            {
                let multiple = Utils.randomInt(1,50);
                this.setBonusCountUI( multiple );
            }
        }
    }

    public setBonusCountUI( multiple:number ):void {
        // const bet = LevelMgr.Instance.getLevelModel().getBet();
        // let coin = Utils.util_formatCoins( bet * multiple,3 );
        // this.m_meta.node.getChildByName("lb_text").getComponent(Label).string = coin;
    }

    public playStopItAction():void{
        if (this.m_levelConfig && this.m_levelConfig.SymbolStopAction){
            let stopActionName = this.m_levelConfig.SymbolStopAction[this.m_data.id.toString()];
            if ( stopActionName != null && stopActionName != "" ){
                let action = LevelMgr.Instance.getLevelModel().getAction();
                if (this.m_data.id == 94 && action == ActionType.RESPIN ){
                    this.playActionByName( stopActionName,true,null );
                }else{
                    this.playActionByName( stopActionName,false,null );
                }
            }
        }
        if (this.m_data.id == 94) {
            let soundFile = this.m_levelConfig.SoundsFile["BonusStop"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
    }
}


