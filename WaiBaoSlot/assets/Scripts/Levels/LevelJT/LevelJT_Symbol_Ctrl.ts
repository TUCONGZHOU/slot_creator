import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl } from '../../Mgr/UIMgr';
import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';
import { ActionType, SymbolRollData, SymbolViewType } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelJT_Symbol_Ctrl')
export class LevelJT_Symbol_Ctrl extends BaseSymbolUnit {
    
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
        }else if ( data.id == 95 || data.id == 96){
            // this.view['Socre_linghting_jin/lb_text'].active = false
        }
    }

    public setBonusCountUI( multiple:number ):void {
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let coin = Utils.util_formatCoins( bet * multiple,3 );
        this.m_meta.node.getChildByName("lb_text").getComponent(Label).string = multiple;
    }
    public cloneBonusLebel(){
        if (this.m_data.id == 94 || this.m_data.id == 95 || this.m_data.id == 96){
            let node = this.m_meta.node.getChildByName("lb_text").cloneBonusLebel()
            return node
        }
    }

    public playStopItAction():void{
        if (this.m_levelConfig && this.m_levelConfig.SymbolStopAction){
            let stopActionName = this.m_levelConfig.SymbolStopAction[this.m_data.id.toString()];
            if ( stopActionName != null && stopActionName != "" ){
                let action = LevelMgr.Instance.getLevelModel().getAction();
                if ((this.m_data.id == 94 || this.m_data.id == 95 || this.m_data.id == 96) && action == ActionType.RESPIN ){
                    this.playActionByName( stopActionName,false,null );
                }else{
                    this.playActionByName( stopActionName,false,null );
                }
            }
        }
        if (this.m_data.id == 94 || this.m_data.id == 95 || this.m_data.id == 96) {
            let soundFile = this.m_levelConfig.SoundsFile["BonusStop"];
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
    }

    public addBonusNum( addNum:number ){
        if (this.m_data.id == 95 || this.m_data.id == 96) {
            if (this.view['lb_text'].active == false){
                this.view['lb_text'].active = true
                this.view['lb_text'].getComponent(Label).string = addNum.toString()
                return;
            }
            let str:string = this.view['lb_text'].getComponent(Label).string
            let oriNum = Number(str)
            if(!isNaN(oriNum)){
                this.view['lb_text'].getComponent(Label).string = (oriNum + addNum).toString()
            }
        }
    }
}


