import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

import { GlEventMgr } from "../Mgr/GlEventMgr"
import { EventName } from '../Mgr/EventName';
import { LevelMgr } from './LevelMgr';
import { ActionType } from '../InterFace/LevelConfig';

@ccclass('PlayerMgr')
export class PlayerMgr extends Component {

    public static Instance:PlayerMgr = null;

    private m_userId:number = 0;
    private m_coin:number = 0; // 当前的金币
    private m_bet:number = 0; // 当前押注
    private m_betList:number[] = []; // 可选押注列表
    private m_jackpots:number[] = []; // 当前的奖池金额
    private m_betIndex:number = 0; // 当前押注在押注列表中的索引

    protected onLoad(): void {
        if( PlayerMgr.Instance === null ){
            PlayerMgr.Instance = this;
        }
        else{
            this.destroy();
            return;
        }
    }

    start() {
        this.m_bet = 1000;
        this.m_betIndex = 0;
        this.m_betList = [1000,2000,3000,4000,5000,6000,7000,8000,9000,10000];
        this.m_jackpots = [10000000,50000000,200000000,1000000000];
        
        // 初始化金币
        let goldStr = sys.localStorage.getItem('gold');
        if (goldStr === null || goldStr === '') {
            sys.localStorage.setItem('gold', '100000');
            goldStr = '100000';
        }
        else {
            // test
            //sys.localStorage.setItem('gold', '100');
            //goldStr = '100';
        }
        let gold = parseInt(goldStr);
        this.m_coin = gold;
    }

    update(deltaTime: number) {
        
    }

    public getUserId():number {
        return this.m_userId;
    }

    // 当前的金币
    public getCoin():number {
        return this.m_coin;
    }

    // 存入金币
    public addCoin(amount:number):void {
        this.m_coin += amount;
        // 立即存储
        sys.localStorage.setItem('gold', this.m_coin.toString());
        // 刷新金币
        GlEventMgr.Instance.emit(EventName.RefreshTopCoinUI);
        // 发送消息给服务器
    }

    // spin扣除金币
    public spinReduceCoin(){
        let action = LevelMgr.Instance.getLevelModel().getAction();
        // 只有normal才扣钱
        if ( action == ActionType.NORMAL ){
            let bet = this.getBet();
            this.m_coin -= bet;
            // 立即存储
            sys.localStorage.setItem('gold', this.m_coin.toString());
            // -- 发送消息 bottom显示赢钱
            GlEventMgr.Instance.emit(EventName.RefreshTopCoinUI);
            // 发送消息给服务器
        }
    }

    // 当前的押注
    public getBet():number {
        return this.m_bet;
    }

    public getBetIndex():number {
        return this.m_betIndex;
    }

    public addBetIndex():void {
        if (this.m_betIndex < this.m_betList.length - 1) {
            this.m_betIndex++;
            this.m_bet = this.m_betList[this.m_betIndex];
        }
        else{
            this.m_betIndex = 0;
            this.m_bet = this.m_betList[this.m_betIndex];
        }
    }

    public reduceBetIndex():void {
        if (this.m_betIndex > 0) {
            this.m_betIndex--;
            this.m_bet = this.m_betList[this.m_betIndex];
        }
        else{
            this.m_betIndex = this.m_betList.length - 1;
            this.m_bet = this.m_betList[this.m_betIndex];
        }
    }

    public setBetIndex(index:number):void {
        if (index >= 0 && index < this.m_betList.length) {
            this.m_betIndex = index;
            this.m_bet = this.m_betList[index];
        }
    }

    public getBetList():number[] {
        return this.m_betList;
    }

    public getJackpots():number[] {
        return this.m_jackpots;
    }
}


