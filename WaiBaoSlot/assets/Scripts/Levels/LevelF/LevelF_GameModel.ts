import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameModel } from '../../GameBase/BaseGameModel';


export class LevelF_GameModel extends BaseGameModel {
    private m_collect:any = null;

    public parseData( data:any ):void{
        super.parseData( data );
        this.m_collect = data.collect;
    }

    public getCollect():any{
        return this.m_collect;
    }

    public qiPaoIsCollected( col:number,row:number ):boolean{
        for( const v of this.m_collect.collectPosition ){
            if ( v.col == col && v.row == row ){
                return true;
            }
        }
        return false
    }
}


