import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseSymbolUnit } from '../../GameBase/BaseSymbolUnit';
import { SymbolRollData } from '../../InterFace/LevelConfig';

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


