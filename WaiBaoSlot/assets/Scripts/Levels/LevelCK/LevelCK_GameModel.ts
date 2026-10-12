import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../../GameBase/BaseGameModel';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ActionType } from '../../InterFace/LevelConfig';

export class LevelCK_GameModel extends BaseGameModel {
    private m_collect:any = null;

    public parseData( data:any ):void{
        super.parseData( data );
    }

    // 重写基类
    public noticeEventToView():void {
        let action = this.getAction();
        let nextAction = this.getNextAction();
        
        if (action == ActionType.NORMAL && nextAction == ActionType.FREESPIN){
            // 需要播放动画 动画播放完后再发送消息
            GlEventMgr.Instance.emit(EventName.View_CK_LevelSpin_responese);
            return;
        }
        if (action == ActionType.NORMAL && nextAction == ActionType.RESPIN){
            // 需要播放动画 动画播放完后再发送消息
            GlEventMgr.Instance.emit(EventName.View_CK_LevelSpin_responese);
            return;
        }

        GlEventMgr.Instance.emit(EventName.View_LevelSpin_responese);
    }

}


