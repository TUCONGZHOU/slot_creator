import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../../GameBase/BaseGameModel';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ActionType } from '../../InterFace/LevelConfig';

export class LevelTR_GameModel extends BaseGameModel {
    private m_collect:any = null;

    public parseData( data:any ):void{
        super.parseData( data );
    }

    // 重写基类
    public noticeEventToView():void {
        let action = this.getAction();
        let nextAction = this.getNextAction();

        if(action == ActionType.BONUS){
            GlEventMgr.Instance.emit(EventName.View_LevelSpin_bonus);
        }else {
            GlEventMgr.Instance.emit(EventName.View_LevelSpin_responese);
        }
    }

}


