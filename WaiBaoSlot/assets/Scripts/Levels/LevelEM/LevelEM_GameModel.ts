import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;


import { BaseGameModel } from '../../GameBase/BaseGameModel';


@ccclass('LevelEM_GameModel')
export class LevelEM_GameModel extends BaseGameModel {

    private m_collectAction:any = null;
    private m_collectLeftCount:number = 0;
    private m_collectRightCount:number

    public parseData( data:any ):void{
        super.parseData( data );
        this.m_collectAction = data.collectAction;
        this.m_collectLeftCount = data.collectLeftCount;
        this.m_collectRightCount = data.collectRightCount;
    }

    public getCollectAction():any{
        return this.m_collectAction;
    }

    public getCollectLeftCount():number{
        return this.m_collectLeftCount;
    }

    public getCollectRightCount():number{
        return this.m_collectRightCount ;
    }
}


