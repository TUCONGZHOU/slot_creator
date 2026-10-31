import { _decorator, Component, Node,sp,Tween,tween } from 'cc';
const { ccclass, property } = _decorator;

import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';
import { ActionType, SymbolRollData, SymbolViewType,StoredIconStruct } from '../../InterFace/LevelConfig';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';

@ccclass('LevelEM_Symbol_Ctrl')
export class LevelEM_Symbol_Ctrl extends BaseSymbolUnit {
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

        let action = LevelMgr.Instance.getLevelModel().getAction();
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();

        if( data.id != 90 && data.id != 92 && data.id != 94 && data.id != 96 ){
            if (action == ActionType.RESPIN){
                this.m_meta.node.getChildByName("SpriteSplash").active = true;
            }else{
                if(action == ActionType.NORMAL){
                    if ( this.m_viewRow != -1 ){
                        this.m_meta.node.getChildByName("SpriteSplash").active = true;
                    }else{
                        this.m_meta.node.getChildByName("SpriteSplash").active = false;
                    }
                }else {
                    this.m_meta.node.getChildByName("SpriteSplash").active = false;
                }
            }
        }
        
    }

    public playStopItAction():void{

        if (this.m_data.id == 94 || this.m_data.id == 96) {
            if (this.m_levelConfig && this.m_levelConfig.SymbolStopAction){
            let stopActionName = this.m_levelConfig.SymbolStopAction[this.m_data.id.toString()];
            if ( stopActionName != null && stopActionName != "" ){
                    this.playActionByName( stopActionName,true,null );
                }
            }
            return;
        }
        super.playStopItAction();
    }
}


