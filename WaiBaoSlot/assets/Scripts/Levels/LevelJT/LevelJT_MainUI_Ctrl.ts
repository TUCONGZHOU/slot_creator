import { _decorator, Component, instantiate, Node,Prefab,tween, Vec3,sp } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelJT_ChangeSpinView_Ctrl } from './LevelJT_ChangeSpinView_Ctrl';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { UIMgr,UILayer } from '../../Mgr/UIMgr';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelJT_BonusStartView_Ctrl } from './LevelJT_BonusStartView_Ctrl';
import { LevelJT_FreeGameTable_Ctrl } from './LevelJT_FreeGameTable_Ctrl';
import { LevelJT_ReSpinView_Ctrl } from './LevelJT_ReSpinView_Ctrl';
import { LevelJT_Symbol_Ctrl } from './LevelJT_Symbol_Ctrl';
import { LevelJT_NormalGameTable_Ctrl } from './LevelJT_NormalGameTable_Ctrl';
import { LevelJT_ReSpinGameTable_Ctrl } from './LevelJT_ReSpinGameTable_Ctrl';


@ccclass('LevelJT_MainUI_Ctrl')
export class LevelJT_MainUI_Ctrl extends BaseGameMain {
    public m_gameTableCompent: LevelJT_NormalGameTable_Ctrl |LevelJT_FreeGameTable_Ctrl | LevelJT_ReSpinGameTable_Ctrl | null = null;
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
            console.log("=========> 显示GameNormal轮盘")
            this.addNormalGameTableUI();
        }else if(action == ActionType.BONUS){
            this.enterBonus()
        }else if(action == ActionType.FREESPIN){
            this.enterFreeSpin()
        }else if(action == ActionType.RESPIN){
            this.enterReSpin()
        }
    }

    // 进入freespin
    public enterFreeSpin():void{
        // this.view['SpineWan'].active = false

        const anims: Array<ReturnType<typeof tween>> = [];
        // 要播放scatter的动画
        let changeSpinViewCtrl:LevelJT_ChangeSpinView_Ctrl = null;

        tween(this.node).call(()=>{
            this.m_gameTableCompent.stopGameTableLineAction();
            this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
            // -- 音效
            let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }
        })
        .call(()=>{
            // 显示轮盘切换界面
            changeSpinViewCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/ChangeSpinView","LevelJT_ChangeSpinView_Ctrl",UILayer.Normal) as LevelJT_ChangeSpinView_Ctrl;
            changeSpinViewCtrl.initUI( this.m_levelConfig,this,"FREESPIN" );
        })
        .start();
    }

    // 进入normal
    public enterNormal():void{
        // // 移除当前轮盘
        // this.removeGameTable();
        // this.view['SpineWan'].active = true
        // // 添加normal的轮盘
        // this.addNormalGameTableUI();
        // // 恢复点击
        // GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        // // 发送消息
        // // GlEventMgr.Instance.emit(EventName.ClearWinAmount);
        // // 改变bg
        // GlEventMgr.Instance.emit(EventName.ChangeBg,true);

        // 显示轮盘切换界面
        let changeSpinViewCtrl:LevelJT_ChangeSpinView_Ctrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/ChangeSpinView","LevelJT_ChangeSpinView_Ctrl",UILayer.Normal) as LevelJT_ChangeSpinView_Ctrl;
        changeSpinViewCtrl.initUI( this.m_levelConfig,this,"NORMAL" );
    }
    public otherUIChangeToNomal():void{
        this.view['SpineWan'].active = true
    }

    public enterBonus():void{
        // this.view['SpineWan'].active = false
        // 播放音效
        SoundMgr.Instance.stopBGM();
        let soundFile = this.m_levelConfig.SoundsFile["BonusBg"];
        if (soundFile){
            SoundMgr.Instance.playBGM( this.m_levelConfig.BundleName,soundFile ); 
        }
        // 显示bonus界面
        // let bonusSpinCtrl:LevelJT_BonusStartView_Ctrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/BonusView","LevelJT_BonusStartView_Ctrl",UILayer.Normal) as LevelJT_BonusStartView_Ctrl;
        // bonusSpinCtrl.initUI( this.m_levelConfig );
        let prefab = ResMgr.Instance.getAsset("LevelJT","Prefabs/BonusView",Prefab);
        if(prefab){
            let bonusNode = instantiate(prefab);
            this.view["BonusGame"].addChild(bonusNode);
            const compent:LevelJT_BonusStartView_Ctrl = bonusNode.addComponent( LevelJT_BonusStartView_Ctrl ) as LevelJT_BonusStartView_Ctrl;
            compent.initUI( this.m_levelConfig );
        }
        
    }
    // 进入respin（修复崩溃 + 修复TS报错版本）
    public async enterReSpin(): Promise<void> {

        try {
            // this.view['SpineWan'].active = false

            const anims: Array<ReturnType<typeof tween>> = [];
            // 要播放scatter的动画 
            let changeSpinViewCtrl:LevelJT_ChangeSpinView_Ctrl = null;
            // anims.push(
            //     tween(this.node).delay(1)
            // );
            // anims.push(
            //     tween(this.node).call(()=>{
            //         this.m_gameTableCompent.stopGameTableLineAction();
            //         // this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
            //         // -- 音效
            //         let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
            //         if (soundFile){
            //             SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            //         }
            //     })
            // );
            // // anims.push(
            // //     tween(this.node).delay(2)
            // // );
            // anims.push(
            //     tween(this.node).call(()=>{
            //         // 显示轮盘切换界面
            //         changeSpinViewCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/ChangeSpinView","LevelJT_ChangeSpinView_Ctrl",UILayer.Normal) as LevelJT_ChangeSpinView_Ctrl;
            //         changeSpinViewCtrl.initUI( this.m_levelConfig,this,"RESPIN" );
            //     })
            // );

            // tween(this.node).sequence(...anims).start();

            tween(this.node)
            .call(()=>{
                this.m_gameTableCompent.stopGameTableLineAction();
                // this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
                // -- 音效
                let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
            })
            .call(()=>{
                // 显示轮盘切换界面
                changeSpinViewCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/ChangeSpinView","LevelJT_ChangeSpinView_Ctrl",UILayer.Normal) as LevelJT_ChangeSpinView_Ctrl;
                changeSpinViewCtrl.initUI( this.m_levelConfig,this,"RESPIN" );
            })
            .start();

        } catch (err) {
            console.error("enterReSpin执行异常:", err);
            throw err; // 向外抛出异常，与原 reject 行为一致
        }

    }
    public removeGameTable(){
        super.removeGameTable();
        this.view['SpineWan'].active = false
    }

    // wild的飞行动画
    public wildFlyAction( col:number,row:number ){
        // 播放spine动画
        let piaoPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/NormalCollect",Prefab);
        if(piaoPrefab){
            let piaoNode = instantiate(piaoPrefab);
            this.node.addChild(piaoNode);
            let worldPos = this.m_gameTableCompent.getSymbolWorldPos( 0,col,row );
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.node.inverseTransformPoint(localPos,worldPos);
            piaoNode.position = localPos;
            piaoNode.scale = new Vec3(0.5,0.5,1)

            // SpineTree
            let destPos = this.view["SpineWan"].getPosition();

            let spine = piaoNode.getChildByName("all_xfj_sj").getComponent(sp.Skeleton);
            spine.setAnimation(0, "Game4-fly-bianfu", false);
            let soundFile = this.m_levelConfig.SoundsFile["wildFly"];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }

            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null); // 清除监听器
            });
            tween(piaoNode)
            .parallel(
                // 1. 上升
                tween(piaoNode).to( 1, {position: destPos}, { easing: 'quadInOut' }),
                tween(piaoNode).sequence(
                    // 2. 接着 1 秒内：先放大到2倍，再缩回1倍
                    tween().to(0.5, { scale: new Vec3(1, 1, 1) }),
                    tween().to(0.5, { scale: new Vec3(0.1, 0.1, 1) })
                )
            )
            // 3. 结束后移除
            .call(() => {
                // 音效
                // let soundFile = this.m_levelConfig.SoundsFile["TreeGlow"];
                // if (soundFile){
                //     SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                // }
                // 播放spine动画
                let spine = this.view["SpineWan/315_tree"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game4-wan-guang", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null); // 清除监听器
                    spine.setAnimation(0, "Game4-wan-idle", true);
                });

                if (piaoNode.isValid) {
                    piaoNode.active = false;
                    this.scheduleOnce(() => {
                        if (piaoNode.isValid) {
                            piaoNode.removeFromParent();
                            piaoNode.destroy();
                        }
                    }, 0.1);
                }
            })
            .start();
        }
    }
    // freeGame飞行bouns
    public newBonusFlyAction( col:number,row:number,bonusIndex:number ){
        // 播放spine动画
        let piaoPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FreeCollect",Prefab);
        if(piaoPrefab){
            let piaoNode = instantiate(piaoPrefab);
            this.node.addChild(piaoNode);
            let worldPos = this.m_gameTableCompent.getSymbolWorldPos( 0,col,row );
            let localPos = new Vec3();
            // 将世界坐标转化为局部坐标
            this.node.inverseTransformPoint(localPos,worldPos);
            piaoNode.position = localPos;
            piaoNode.scale = new Vec3(0.5,0.5,1)

            // SpineTree
            let destPos = this.view["SpineWan"].getPosition();

            let spine = piaoNode.getChildByName("all_xfj_sj").getComponent(sp.Skeleton);
            spine.setAnimation(0, "317_flyy", false);
            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null); // 清除监听器
            });
            let soundFile = this.m_levelConfig.SoundsFile["goldBonusFly" + bonusIndex];
            if (soundFile){
                SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
            }
            tween(piaoNode)
            .parallel(
                // 1. 上升
                tween(piaoNode).to( 0.5, {position: destPos}, { easing: 'quadInOut' }),
                tween(piaoNode).sequence(
                    // 2. 接着 1 秒内：先放大到2倍，再缩回1倍
                    // tween().to(0.5, { scale: new Vec3(1, 1, 1) }),
                    // tween().to(0.5, { scale: new Vec3(0.1, 0.1, 1) })
                )
            )
            // 3. 结束后移除
            .call(() => {
                // 音效
                // let soundFile = this.m_levelConfig.SoundsFile["TreeGlow"];
                // if (soundFile){
                //     SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                // }
                if (this.m_gameTableCompent instanceof LevelJT_FreeGameTable_Ctrl){
                    this.m_gameTableCompent.resetJackpotTitle();
                }

                if (piaoNode.isValid) {
                    piaoNode.active = false;
                    this.scheduleOnce(() => {
                        if (piaoNode.isValid) {
                            piaoNode.removeFromParent();
                            piaoNode.destroy();
                        }
                    }, 0.1);
                }
            })
            .start();
        }
    }
    // reSpinGame飞行bouns
    public reSpinBonusFlyAction( mulit:number,col:number,row:number,endCol:number,endRow:number,callBack:Function,collectIndex:number,bonusColor:string ){
        
        // 播放spine动画
        let func = ()=>{
            let piaoPrefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/FreeCollect",Prefab);
            if(piaoPrefab){
                let piaoNode = instantiate(piaoPrefab);
                this.node.addChild(piaoNode);
                let worldPos = this.m_gameTableCompent.getSymbolWorldPos( 0,col,row );
                let localPos = new Vec3();
                // 将世界坐标转化为局部坐标
                this.node.inverseTransformPoint(localPos,worldPos);
                piaoNode.position = localPos;
                piaoNode.scale = new Vec3(0.5,0.5,1)

                // SpineTree
                let endWorldPos = this.m_gameTableCompent.getSymbolWorldPos( 0,endCol,endRow );
                let localEndPos = new Vec3();
                this.node.inverseTransformPoint(localEndPos,endWorldPos);

                let spine = piaoNode.getChildByName("all_xfj_sj").getComponent(sp.Skeleton);
                spine.setAnimation(0, "317_flyy", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null); // 清除监听器
                });
                // let soundFile = this.m_levelConfig.SoundsFile["goldBonusFly" + collectIndex];
                // if (bonusColor == "gold"){
                //     soundFile = this.m_levelConfig.SoundsFile["goldBonusFly" + collectIndex];
                // }else if (bonusColor == "green"){
                //     soundFile = this.m_levelConfig.SoundsFile["greenBonusFly" + collectIndex];
                // }
                let soundFile = this.m_levelConfig.SoundsFile["redBounsFly" + collectIndex];
                if (bonusColor == "gold"){
                    soundFile = this.m_levelConfig.SoundsFile["redBounsFly" + collectIndex];
                }else if (bonusColor == "green"){
                    soundFile = this.m_levelConfig.SoundsFile["redBounsFly" + collectIndex];
                }
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
                tween(piaoNode)
                .parallel(
                    // 1. 上升
                    tween(piaoNode).to( 0.5, {position: localEndPos}, { easing: 'quadInOut' }),
                    tween(piaoNode).sequence(
                        // 2. 接着 1 秒内：先放大到2倍，再缩回1倍
                        // tween().to(0.5, { scale: new Vec3(1, 1, 1) }),
                        // tween().to(0.5, { scale: new Vec3(0.1, 0.1, 1) })
                    )
                )
                // 3. 结束后移除
                .call(() => {
                    // 音效
                    // let soundFile = this.m_levelConfig.SoundsFile["TreeGlow"];
                    // if (soundFile){
                    //     SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    // }

                    if(this.m_gameTableCompent instanceof LevelJT_ReSpinGameTable_Ctrl)
                    {
                        // let symbolNode = this.m_gameTableCompent.getSymbolNode(0,endCol,endRow);
                        // if (symbolNode){
                        //     symbolNode.getComponent(LevelJT_Symbol_Ctrl).addBonusNum( mulit );
                        // }
                        let symbolId = LevelMgr.Instance.getLevelModel().getSymbolId( 0,endCol,endRow);
                        this.m_gameTableCompent.playBonusNumAction(mulit,endCol,endRow,symbolId);
                        this.m_gameTableCompent.resetJackpotTitle();
                    }
                    
                    if (callBack){
                        callBack()
                    }

                    if (piaoNode.isValid) {
                        piaoNode.active = false;
                        this.scheduleOnce(() => {
                            if (piaoNode.isValid) {
                                piaoNode.removeFromParent();
                                piaoNode.destroy();
                            }
                        }, 0.1);
                    }
                })
                .start();
            }else{
                if (callBack){
                    callBack()
                }
            }
        }

        let startSymbolNode = (this.m_gameTableCompent as LevelJT_ReSpinGameTable_Ctrl).getSymbolNode(0,col,row);
        if (startSymbolNode){
            let startSymbolId = LevelMgr.Instance.getLevelModel().getSymbolId( 0,col,row);
            let stopActionName = this.m_levelConfig.SymbolStopAction[startSymbolId.toString()];
            startSymbolNode.getComponent(LevelJT_Symbol_Ctrl).playSymbolAction(stopActionName,false,func,false,2);
        }else{
            func();
        }
    }

    public showPayInfo():void{
        UIMgr.Instance.showUi("LevelJT","Prefabs/PayTable","LevelJT_PayTable_Ctrl",UILayer.Normal);
    }
}


