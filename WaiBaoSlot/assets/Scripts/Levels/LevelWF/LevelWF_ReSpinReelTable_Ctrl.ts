import { _decorator, Component, Node, tween, Vec3,Prefab, instantiate, Label } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelTable } from '../../GameBase/BaseReelTable';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { EventName } from '../../Mgr/EventName';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { ResMgr } from '../../Mgr/ResMgr';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelWF_RespinBetTip_Ctrl } from './LevelWF_RespinBetTip_Ctrl';
import { ActionType,StoredIconStruct,SymbolType } from '../../InterFace/LevelConfig';
import { LevelWF_RespinReelUnit_Ctrl } from "./LevelWF_RespinReelUnit_Ctrl";
import { Utils } from '../../Util/Utils';
import { LevelWF_ReSpinGameTable_Ctrl } from './LevelWF_ReSpinGameTable_Ctrl';
import { LevelWF_ReSpinGameTable2_Ctrl } from './LevelWF_ReSpinGameTable2_Ctrl';

type FlyBonusMeta = {
    col: number;
    row: number;
    coin: number;
    id:number;
}

@ccclass('LevelWF_ReSpinReelTable_Ctrl')
export class LevelWF_ReSpinReelTable_Ctrl extends BaseReelTable {

    private m_reReSpinTimes:number = 6;
    private m_allFlyData:FlyBonusMeta[] = null;
    private m_flyIndex:number = 0;

    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
        this.view["ReSpinNum2"].active = false;
        this.view["PressStartNode/SpriteSplash"].active = false;
        // 显示次数
        this.setReSpinNumUI();

        if(this.m_reelTableIndex == 1){
            this.view["ReSpinNum"].active = false;
        }
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    public setReSpinNumUI():void{
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let reSpinsTotalCount = respinInfo.reSpinsTotalCount;
        let reSpinCurCount = respinInfo.reSpinCurCount;
        // 次数
        this.view["ReSpinNum/lb_count1"].getComponent(Label).string = ""+reSpinCurCount;
        this.view["ReSpinNum/lb_total"].getComponent(Label).string = ""+reSpinsTotalCount;
    }

    public hideReSpinNumUI():void{
        this.view["ReSpinNum"].active = false;
    }

    public getReSpinNumNodeWorldPos():Vec3{
        let node = this.view["ReSpinNum2"];
        return node.getWorldPosition();
    }

    public showReSpinNum2(){
        this.view["ReSpinNum2"].active = true;
        this.view["ReSpinNum2"].setScale(0.1,0.1,1);
        this.view["ReSpinNum2/Number2"].active = false;
        this.view["ReSpinNum2/Number3"].active = false;
        this.view["ReSpinNum2/Number4"].active = false;
        this.view["ReSpinNum2/Number5"].active = false;

        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let riseUpBet = respinInfo.riseUpBet;
        this.view["ReSpinNum2/Number"+riseUpBet].active = true;

        tween(this.view["ReSpinNum2"])
        .to( 0.5, {scale: new Vec3(0.7, 0.7, 1)})
        .call(()=>{
            if (this.m_reelTableIndex == 0){
                let delayTime = 0.1;
                if(respinInfo.type == 5){
                    delayTime = 3.5;
                }
                Utils.performWithDelay(this.node,()=>{
                    this.showPressToStart();
                },delayTime);
            }
        })
        .start();
    }

    public showPressToStart():void{
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/PressToStart",Prefab);
        if(prefab){
            let tipsNode = instantiate(prefab);
            this.view["PressStartNode"].addChild(tipsNode);

            this.view["PressStartNode/SpriteSplash"].active = true;

            // 音效
            let soundFile = this.m_levelConfig.SoundsFile["PressToStart"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }
            // 动画
            tipsNode.setScale(0.1,0.1,1);
            tween(tipsNode)
            .to( 0.5, {scale: new Vec3(0.8, 0.8, 1)})
            .delay(2)
            .to( 0.5, {scale: new Vec3(0, 0, 1)})
            .call(()=>{
                tipsNode.destroy();
                this.view["PressStartNode/SpriteSplash"].active = false;

                let soundFile = this.m_levelConfig.SoundsFile["ReSpinBg2"];
                // 停止循环音效
                if (soundFile){
                    SoundMgr.Instance.stopLoopSound(soundFile);
                }

                // 播放音效
                let soundFile1 = this.m_levelConfig.SoundsFile["ReSpinPlay"];
                if (soundFile1){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile1,1,true );
                }
                
                // 播放音效
                let soundFile2 = this.m_levelConfig.SoundsFile["PressToStart"];
                if (soundFile2){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile2 );
                }

                // 恢复点击
                GlEventMgr.Instance.emit( EventName.RecoverSpinBtn );
            })
            .start();
        }
    }

    public addRespinBetTips():void{
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinBetTip",Prefab);
        if(prefab){
            let tipsNode = instantiate(prefab);
            this.view["RespinBetTipNode"].addChild(tipsNode);

            let worldPos = this.getReSpinNumNodeWorldPos();
            let callBack = ()=>{
                // 显示respin的number
                this.showReSpinNum2();
            };
            const compent:LevelWF_RespinBetTip_Ctrl = tipsNode.addComponent( LevelWF_RespinBetTip_Ctrl ) as LevelWF_RespinBetTip_Ctrl;
            compent.initData(this.m_levelConfig,worldPos,callBack);
        }
    }

    // 结算的bet动画
    public showJieSuanRespinBetTips( callBack:Function ):void{
        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinBetTip",Prefab);
        if(prefab){
            let tipsNode = instantiate(prefab);
            this.view["RespinBetTipNode"].addChild(tipsNode);
            let node = this.view["ReSpinNum2/Number2"];
            let worldPos = node.getWorldPosition();
            const compent:LevelWF_RespinBetTip_Ctrl = tipsNode.addComponent( LevelWF_RespinBetTip_Ctrl ) as LevelWF_RespinBetTip_Ctrl;
            compent.jiesuanAction( this.m_levelConfig,worldPos,callBack );
        }
    }

    // 信号块播放数字增长动画
    public playBonusNumAction( list:StoredIconStruct[] ):void{
        for (let i = 0; i < list.length; i++) {
            let meta = list[i];
            this.playSymbolAction( meta.col,meta.row,"Game2-jinbi3",false );
            // 上面的数字滚动
            let compent = this.getReelUnitCompent( meta.col ) as LevelWF_RespinReelUnit_Ctrl;
            compent.bonusGrowUpAction(meta.row,list);
            
            Utils.performWithDelay(this.node,()=>{
                this.playSymbolAction( meta.col,meta.row,"Game2-jinbi2",true );
            },1.6)
        }

        // 数字滚动的音效
        let soundFile1 = this.m_levelConfig.SoundsFile["CoinIncrease"];
        if (soundFile1){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile1,1,false );
        }
    }

    // respin结束的数字增长动画
    public playBonusNumGrowUpByRespinOver():void{
        let reelData:number[][] = LevelMgr.Instance.getLevelModel().getSpinReelData()[this.m_reelTableIndex];
        let hasBonus = false;
        for (let i = 0; i < this.m_reelUnitsCount; i++) {
            let onnColData = reelData[i];
            for (let j = 0; j < onnColData.length; j++) {
                let symbolId = onnColData[j];
                let config = LevelMgr.Instance.getSymbolConfig( symbolId ); 
                if ( config.type == SymbolType.BONUS && symbolId == 94 ){
                    // 缩放动画 + 上面的数字滚动
                    let compent = this.getReelUnitCompent( i ) as LevelWF_RespinReelUnit_Ctrl;
                    compent.bonusGrowUpByResepinOver(j);
                    hasBonus = true;
                }
            }
        }
        if(hasBonus){
            // 数字滚动的音效
            let soundFile1 = this.m_levelConfig.SoundsFile["CoinIncreaseBig"];
            if (soundFile1){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile1,1,false );
            }
        }
    }

    public playBonuJackpotAction(col:number,row:number,actionName:string,callBack:Function|null = null):void{
        // 播放三次
        this.quickRunActionByReSpinOver(col,row,actionName,()=>{
            this.m_reReSpinTimes = this.m_reReSpinTimes - 1;
            if( this.m_reReSpinTimes > 0 ){
                this.playBonuJackpotAction(col,row,actionName,callBack);
            }
            else {
                this.m_reReSpinTimes = 6;
                if(callBack){
                    callBack();
                }
            }
        });
    }

    public quickRunActionByReSpinOver( col:number,row:number,actionName:string,callBack:Function|null = null ):void{
        let compent:LevelWF_RespinReelUnit_Ctrl = this.getReelUnitCompent( col ) as LevelWF_RespinReelUnit_Ctrl;
        compent.quickRunActionByReSpinOver(row,actionName,callBack);
    }


    // 计算这个轮盘要飞行的数据
    public initDlyBonusActionData():void{
        // 找出所有要飞的
        let allFlyData:FlyBonusMeta[] = [];
        const bet = LevelMgr.Instance.getLevelModel().getBet();
        let index = this.m_reelTableIndex;
        let reelData:number[][] = LevelMgr.Instance.getLevelModel().getRespinReelData()[index];
        // 找出 94--99 的信号块
        for( let col = 0;col < reelData.length; col++){
            let oneReelData = reelData[col];
            // 找出bonus的信号块
            for( let row = 0;row < oneReelData.length;row ++){
                let symbolId = oneReelData[row];
                if (symbolId == 94){
                    let storeData = LevelMgr.Instance.getLevelModel().getStoredCoin( index,col,row );
                    let multiple = storeData.Multiple;
                    let coin = bet * multiple
                    let meta:FlyBonusMeta = { col:col,row:row,coin:coin,id:symbolId };
                    allFlyData.push(meta);
                }
                else if(symbolId == 95){
                    this.insertSpecialBonusId(col,row,allFlyData,symbolId,"Mini");
                }
                else if(symbolId == 96){
                    this.insertSpecialBonusId(col,row,allFlyData,symbolId,"Minor");
                }
                else if(symbolId == 97){
                    this.insertSpecialBonusId(col,row,allFlyData,symbolId,"Major");
                }
                else if(symbolId == 98){
                    this.insertSpecialBonusId(col,row,allFlyData,symbolId,"Grand");
                }
                else if(symbolId == 99){
                    this.insertSpecialBonusId(col,row,allFlyData,symbolId,"2Mini");
                }
            }
        }
        // 设置
        this.m_allFlyData = allFlyData;
        this.m_flyIndex = 0;
    }

    public insertSpecialBonusId( col:number,row:number,allFlyData:FlyBonusMeta[],symbolId:number,cType:string ):void{
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        let index = this.m_reelTableIndex;
        let jacopot = respinInfo.jacopot[index];
        for( const value of jacopot ){
            if (value.type == cType && col == value.col && row == value.row && value.id == symbolId){
                let meta:FlyBonusMeta = { col:col,row:row,coin:value.MultipleCoin,id:symbolId };
                allFlyData.push(meta);
            }
        }
    }

    public flyBonusAction():void{
        if( this.m_flyIndex >= this.m_allFlyData.length){
            // 飞行结束
            // 播放音效
            let soundFile = this.m_levelConfig.SoundsFile["RespinOver"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }

            let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/RespinOver",Prefab);
            if( prefab ){
                let respinOverNode = instantiate(prefab);
                this.view["RespinBetTipNode"].addChild(respinOverNode);
                Utils.performWithDelay( this.node,()=>{
                    respinOverNode.destroy();
                    // 下一步
                    this.m_gameTableCompent.excuteListFunc();
                },3)
            }

            return;
        }

        let meta = this.m_allFlyData[this.m_flyIndex];
        if( meta.id == 95 ){
            this.jackpotBonusAction("Mini->Minor","Prefabs/JackpotMini",meta);
        }
        else if( meta.id == 96 ){
            this.jackpotBonusAction("K-Minor->Mini","Prefabs/JackpotMinor",meta);
        }
        else if( meta.id == 97 ){
            this.jackpotBonusAction("K-Major->Mini","Prefabs/JackpotMajor",meta);
        }
        else if( meta.id == 98 ){
            this.jackpotBonusAction("K-Grand->Mini","Prefabs/JackpotGrand",meta);
        }
        else if( meta.id == 99 ){
            this.jackpotBonusAction("K-2Mini->Mini","Prefabs/Jackpot2Mini",meta);
        }
        else if( meta.id == 94 ){
            this.coinFlyAction( meta );
        }
    }

    public jackpotBonusAction(actionName:string,prefabPath:string,meta:FlyBonusMeta):void{
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["BonusRun"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 快速旋转
        this.playBonuJackpotAction(meta.col,meta.row,actionName,()=>{
            // 添加spine显示动画
            Utils.performWithDelay( this.node,()=>{
                let prefab = ResMgr.Instance.getAsset(this.m_abName,prefabPath,Prefab);

                // 播放音效
                let soundFile = this.m_levelConfig.SoundsFile["ReSpinStart"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }

                if( prefab ){
                    let jackpotNode = instantiate(prefab);
                    this.view["RespinBetTipNode"].addChild(jackpotNode);
                    Utils.performWithDelay( this.node,()=>{
                        jackpotNode.destroy();
                        // 飞行
                        this.coinFlyAction( meta );
                    },2)
                }
            },1)
        });
    }

    public getParentTotalWinNode():Node{
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        if(respinInfo.type == 5){
            return ((this.m_gameTableCompent as LevelWF_ReSpinGameTable2_Ctrl).view["TotalWinNode"]) as Node;
        }
        else{
            return ((this.m_gameTableCompent as LevelWF_ReSpinGameTable_Ctrl).view["TotalWinNode"]) as Node;
        }
    }

    public coinFlyAction(meta:FlyBonusMeta):void{
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["FlyUp"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }

        let startWorldPos:Vec3 = this.getSymbolWorldPos( meta.col,meta.row );
        // 目标点位置
        let destLocalPos:Vec3 = new Vec3(0,0,0);

        let startLocalPos = new Vec3();
        // 从父节点获取 
        this.getParentTotalWinNode().inverseTransformPoint(startLocalPos,startWorldPos);

        let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FlyCoin",Prefab);
        if( prefab ){
            let flyCoinNode = instantiate(prefab);
            // 从父节点获取 
            this.getParentTotalWinNode().addChild(flyCoinNode);
            flyCoinNode.setPosition(startLocalPos);

            // 飞行
            tween(flyCoinNode)
            .parallel(
                tween().to(0.3, { position: destLocalPos }),
                tween().to(0.3, { scale: new Vec3(0, 0, 1) })
            )
            .call(()=>{
                (this.m_gameTableCompent as LevelWF_ReSpinGameTable_Ctrl).m_totalWinCtrl.setWinCount( meta.coin );
                flyCoinNode.destroy();

                Utils.performWithDelay( this.node,()=>{
                    this.m_flyIndex ++;
                    this.flyBonusAction();
                },0.5)
            })
            .start()
        }
    }


    public playReelStopDoneSounds():void {
        // let soundFile = this.m_levelConfig.SoundsFile["BonusStop"];
        // SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    }
}


