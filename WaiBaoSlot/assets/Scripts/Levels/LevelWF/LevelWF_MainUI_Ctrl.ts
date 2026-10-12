import { _decorator, Component, instantiate, Node,Prefab,tween, Vec3,sp, utils, assert } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { UIMgr,UILayer } from '../../Mgr/UIMgr';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { Utils } from '../../Util/Utils';
import { LevelWF_NormalGameTable_Ctrl } from './LevelWF_NormalGameTable_Ctrl';
import { LevelWF_ReSpinReelTable_Ctrl } from './LevelWF_ReSpinReelTable_Ctrl';
import { LevelWF_NormalReelTable_Ctrl } from './LevelWF_NormalReelTable_Ctrl';

@ccclass('LevelWF_MainUI_Ctrl')
export class LevelWF_MainUI_Ctrl extends BaseGameMain {

    protected initView(): void {
        super.initView();
    }

    start() {
        // 调用基类
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }

    // -- 刚进入游戏 根据状态切换轮盘
    public changeGameTableByEnter():void{
        // 调用基类
        super.changeGameTableByEnter();
        let action = LevelMgr.Instance.getLevelModel().getAction();
        if (action == ActionType.NORMAL){
            // 根据数据显示轮盘上的信号块 显示Normal轮盘 
            this.addNormalGameTableUI();
        }
    }

    public enterReSpin():void{
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["ReSpinBg2"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile,1,true );
        }
        // 音效
        let soundFile2 = this.m_levelConfig.SoundsFile["Won1"];
        if (soundFile2){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile2 );
        }

        // 清空赢钱
        // GlEventMgr.Instance.emit(EventName.ClearWinAmount);

        // spine动画
        (this.m_gameTableCompent as LevelWF_NormalGameTable_Ctrl).playYuanBaoEnterRepinAaction( ()=>{
            (this.m_gameTableCompent as LevelWF_NormalGameTable_Ctrl).setSpriteSplashVisible( true )
            // 飞行
            let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
            this.jackpotCoinFly(1,respinInfo.type);
        });
    }

    public jackpotCoinFly(index:number,destIndex:number):void{
        // 音效
        let soundFile = this.m_levelConfig.SoundsFile["Won"+index];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
        }
        // 飞行
        let startPos = (this.m_gameTableCompent as LevelWF_NormalGameTable_Ctrl).getYuanBaoNodeWorldPos(index);
        let endPos = (this.m_gameTableCompent as LevelWF_NormalGameTable_Ctrl).getJackpotEndWorldPos();
        let localStartPos = new Vec3();
        // 将世界坐标转化为局部坐标
        this.view["RespinFlyNode"].inverseTransformPoint(localStartPos,startPos);
        let localEndPos = new Vec3();
        this.view["RespinFlyNode"].inverseTransformPoint(localEndPos,endPos);
        let flyPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/ReSpinNodeFly",Prefab);
        if(flyPrefab){
            let flyNode = instantiate(flyPrefab);
            this.view["RespinFlyNode"].addChild(flyNode);
            flyNode.setPosition(localStartPos);

            let contrlPos = localStartPos.clone();
            contrlPos.x = contrlPos.x - 200;
            contrlPos.y = contrlPos.y - 350;
            Utils.startQuadraticBezierMove(flyNode,0.4,localStartPos,contrlPos,localEndPos,()=>{
                flyNode.destroy();
                this.createRespinTips(index);
                // 下一个
                if (index < destIndex){
                    Utils.performWithDelay(this.node,()=>{
                        this.jackpotCoinFly(index+1,destIndex);
                    },1.2)
                }else{
                    // 播放羽毛的spine动画
                    Utils.performWithDelay(this.node,()=>{
                        this.playYuMaoSpineAction();
                    },1.2)
                }
            });
        }
    }

    public createRespinTips(index:number):void{
        (this.m_gameTableCompent.getReelTableCompent(0) as LevelWF_NormalReelTable_Ctrl).createRespinTips(index);
    }

    // 羽毛spine 播放完后会添加respin的轮盘
    public async playYuMaoSpineAction():Promise<void>{
        let yuMaoPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/YuMaoSpine",Prefab);
        if(yuMaoPrefab){
            let yuMaoNode = instantiate(yuMaoPrefab);
            this.view["RespinFlyNode"].addChild(yuMaoNode);
            await this.delay(1);
            (this.m_gameTableCompent as LevelWF_NormalGameTable_Ctrl).setSpriteSplashVisible( false )
            // 移除当前轮盘
            this.removeGameTable();
            // 添加respin的轮盘
            this.addRespinGameTableUI();
            await this.delay(2);
            yuMaoNode.destroy();
            // 添加RespinBetTips
            this.addRespinBetTips();
        }
    }

    public async enterNormal():Promise<void>{
        let yuMaoPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/YuMaoSpine",Prefab);
        if(yuMaoPrefab){
            let yuMaoNode = instantiate(yuMaoPrefab);
            this.view["RespinFlyNode"].addChild(yuMaoNode);
            await this.delay(1);
            // 移除当前轮盘
            this.removeGameTable();
            // 添加normal的轮盘
            this.addNormalGameTableUI();
            await this.delay(2);
            yuMaoNode.destroy();

            (this.m_gameTableCompent as LevelWF_NormalGameTable_Ctrl).playBigWinAmountAction();
        }
    }

    // 重写基类 添加respin轮盘
    public addRespinGameTableUI():void{
        assert( this.view["ReSpinGame"] != null,"主界面中必须有ReSpinGame节点" );
        if (this.view["ReSpinGame"]){
            let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
            if(respinInfo.type == 5){
                // 2个轮盘
                this.addGameTableUI( this.m_levelConfig.GameTable.RespinGameTable2,this.view["ReSpinGame"] );
                // 加载轮盘信号块
                let viewSymbolData = LevelMgr.Instance.getLevelModel().getRespinReelData();
                this.m_gameTableCompent.loadGameTableUI(viewSymbolData);

                SoundMgr.Instance.stopBGM();
                // 播放背景音乐
                let soundFile = this.m_levelConfig.SoundsFile["ReSpinBg2"];
                if(soundFile && soundFile != ""){
                    SoundMgr.Instance.playBGM( this.m_levelConfig.BundleName,soundFile,0.5 );
                }
            }else{
                this.addGameTableUI( this.m_levelConfig.GameTable.RespinGameTable,this.view["ReSpinGame"] );
                // 加载轮盘信号块
                let viewSymbolData = LevelMgr.Instance.getLevelModel().getRespinReelData();
                this.m_gameTableCompent.loadGameTableUI(viewSymbolData);

                SoundMgr.Instance.stopBGM();
                // 播放背景音乐
                let soundFile = this.m_levelConfig.SoundsFile["ReSpinBg"];
                if(soundFile && soundFile != ""){
                    SoundMgr.Instance.playBGM( this.m_levelConfig.BundleName,soundFile,0.5 );
                }
            }
        }
    }


    public addRespinBetTips():void{
        let respinInfo = LevelMgr.Instance.getLevelModel().getReSpin();
        (this.m_gameTableCompent.getReelTableCompent(0) as LevelWF_ReSpinReelTable_Ctrl).addRespinBetTips();
        if(respinInfo.type == 5){
            Utils.performWithDelay(this.node,()=>{
                (this.m_gameTableCompent.getReelTableCompent(1) as LevelWF_ReSpinReelTable_Ctrl).addRespinBetTips();
            },3);
        }
    }

    // bonus的飞行动画
    public bonusFlyAction( col:number,row:number ){
       
    }
}


