import { _decorator, assert, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../../GameBase/BaseGameModel';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ActionType } from '../../InterFace/LevelConfig';

export class LevelWF_GameModel extends BaseGameModel {

    public parseData( data:any ):void{
        super.parseData( data );
    }

    public parseStoredIcons( storedIcons:any ):any{
        let reelData = null;
        if (this.m_action == ActionType.NORMAL && this.m_nextAction == ActionType.RESPIN){
            reelData = this.getRespinReelData();
        } else {
            reelData = this.getSpinReelData();
        }
        // 外层循环是轮盘
        for( const index in storedIcons ){
            for( const key in storedIcons[index] ){
                let meta = storedIcons[index][key];
                meta.id = reelData[index][meta.col][meta.row];
            }
        }
        return storedIcons
    }
}


