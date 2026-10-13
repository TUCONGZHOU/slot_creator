import { _decorator, Component, instantiate, Node,Prefab,tween, Vec3,sp } from 'cc';
const { ccclass, property } = _decorator;

import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType } from '../../InterFace/LevelConfig';
import { LevelJT_FreeSpinView_Ctrl } from './LevelJT_FreeSpinView_Ctrl';
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
        }
    }

    // 进入freespin
    public enterFreeSpin():void{
        // this.view['SpineWan'].active = false

        const anims: Array<ReturnType<typeof tween>> = [];
        // 要播放scatter的动画 
        let freeSpinCtrl:LevelJT_FreeSpinView_Ctrl = null;
        // anims.push(
        //     tween(this.node).delay(1)
        // );
        anims.push(
            tween(this.node).call(()=>{
                this.m_gameTableCompent.stopGameTableLineAction();
                this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
                // -- 音效
                let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
            })
        );
        // anims.push(
        //     tween(this.node).delay(2)
        // );
        anims.push(
            tween(this.node).call(()=>{
                // 显示freespin界面
                freeSpinCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/FreeSpinView","LevelJT_FreeSpinView_Ctrl",UILayer.Normal) as LevelJT_FreeSpinView_Ctrl;
                freeSpinCtrl.initUI( this.m_levelConfig,this );
            })
        );

        tween(this.node).sequence(...anims).start();
    }

    // 进入normal
    public enterNormal():void{
        // 移除当前轮盘
        this.removeGameTable();
        this.view['SpineWan'].active = true
        // 添加normal的轮盘
        this.addNormalGameTableUI();
        // 恢复点击
        GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
        // 发送消息
        GlEventMgr.Instance.emit(EventName.ClearWinAmount);
        // 改变bg
        GlEventMgr.Instance.emit(EventName.ChangeBg,true);
    }

    public enterBonus():void{
        // this.view['SpineWan'].active = false
        // 播放音效
        let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
        if (soundFile){
            SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile ); 
        }
        // 显示bonus界面
        let bonusSpinCtrl:LevelJT_BonusStartView_Ctrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/BonusStartView","LevelJT_BonusStartView_Ctrl",UILayer.Normal) as LevelJT_BonusStartView_Ctrl;
        bonusSpinCtrl.initUI( this.m_levelConfig );
    }
    // 进入respin（修复崩溃 + 修复TS报错版本）
    public async enterReSpin(): Promise<void> {
        // let reSpinEnterActionCtrl: LevelJT_ReSpinEnterAction_Ctrl = null;
        // let reSpinInfoCtrl: LevelJT_ReStartInfoNode_Ctrl = null;

        try {
            // this.view['SpineWan'].active = false

            const anims: Array<ReturnType<typeof tween>> = [];
            // 要播放scatter的动画 
            let freeSpinCtrl:LevelJT_ReSpinView_Ctrl = null;
            // anims.push(
            //     tween(this.node).delay(1)
            // );
            anims.push(
                tween(this.node).call(()=>{
                    this.m_gameTableCompent.stopGameTableLineAction();
                    // this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
                    // -- 音效
                    let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
                    if (soundFile){
                        SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                    }
                })
            );
            // anims.push(
            //     tween(this.node).delay(2)
            // );
            anims.push(
                tween(this.node).call(()=>{
                    // 显示freespin界面
                    freeSpinCtrl = UIMgr.Instance.showUi(this.m_abName,"Prefabs/ReSpinView","LevelJT_ReSpinView_Ctrl",UILayer.Normal) as LevelJT_ReSpinView_Ctrl;
                    freeSpinCtrl.initUI( this.m_levelConfig,this );
                })
            );

            tween(this.node).sequence(...anims).start();
            // // 1. 播放音效 + 轮盘动画
            // let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
            // if (soundFile) {
            //     SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            // }
            // this.m_gameTableCompent.getReelTableCompent(0).playAllBonusAction();
            // // 2. 延时1秒
            // await this.delay(1);
            // // 3. 停止线动画
            // this.m_gameTableCompent.stopGameTableLineAction();
            // // 4. 显示respin start界面
            // reSpinEnterActionCtrl = UIMgr.Instance.showUi("LevelJT", "Prefabs/ReSpinEnterAction", "LevelJT_ReSpinEnterAction_Ctrl", UILayer.Normal) as LevelJT_ReSpinEnterAction_Ctrl;
            // if (reSpinEnterActionCtrl) {
            //     reSpinEnterActionCtrl.initUI(this.m_levelConfig);
            // }
            // // 5. 延时1.5秒
            // await this.delay(1.5);
            // // 6. 移除当前轮盘
            // this.removeGameTable();
            // // 8. 添加respin轮盘
            // this.addRespinGameTableUI();
            // SoundMgr.Instance.setBGMVolume(0.01);
            // // 9. 延时2秒
            // await this.delay(2.0);
            // // 10. 显示respin信息界面
            // reSpinInfoCtrl = UIMgr.Instance.showUi("LevelJT", "Prefabs/ReStartInfoNode", "LevelJT_ReStartInfoNode_Ctrl", UILayer.Normal) as LevelJT_ReStartInfoNode_Ctrl;
            // reSpinInfoCtrl.startAction(this.m_levelConfig);
            // // 音效
            // soundFile = this.m_levelConfig.SoundsFile["ReSpinInfo"];
            // if (soundFile) {
            //     SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            // }
            // SoundMgr.Instance.setBGMVolume(0.3);
            // // 11. 延时3秒
            // await this.delay(3);
            // // 12. 收尾操作
            // SoundMgr.Instance.setBGMVolume(0.5);
            // UIMgr.Instance.closeUi("LevelJT_ReSpinEnterAction_Ctrl");
            // UIMgr.Instance.closeUi("LevelJT_ReStartInfoNode_Ctrl");
            // GlEventMgr.Instance.emit(EventName.RecoverSpinBtn);
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
            spine.setAnimation(0, "5_88fei", false);
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
                let soundFile = this.m_levelConfig.SoundsFile["TreeGlow"];
                if (soundFile){
                    SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
                }
                // 播放spine动画
                let spine = this.view["SpineWan/315_tree"].getComponent(sp.Skeleton);
                spine.setAnimation(0, "Game4-wan-guang", false);
                spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                    spine.setCompleteListener(null); // 清除监听器
                    spine.setAnimation(0, "Game4-wan-idle", true);
                });

                if (piaoNode.isValid) {
                    piaoNode.removeFromParent();
                    piaoNode.destroy();
                }
            })
            .start();
        }
    }
    // freeGame飞行bouns
    public bonusFlyAction( col:number,row:number ){
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
                    piaoNode.removeFromParent();
                    piaoNode.destroy();
                }
            })
            .start();
        }
    }
    // reSpinGame飞行bouns
    public reSpinBonusFlyAction( mulit:number,col:number,row:number,endCol:number,endRow:number,callBack:Function ){
        
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
                        // let symbolNode00 = this.m_gameTableCompent.getSymbolNode(0,0,0);
                        // let symbolNode01 = this.m_gameTableCompent.getSymbolNode(0,0,1);
                        // let symbolNode02 = this.m_gameTableCompent.getSymbolNode(0,0,2);
                        // let symbolNode10 = this.m_gameTableCompent.getSymbolNode(0,1,0);
                        // let symbolNode11 = this.m_gameTableCompent.getSymbolNode(0,1,1);
                        // let symbolNode12 = this.m_gameTableCompent.getSymbolNode(0,1,2);
                        // let symbolNode20 = this.m_gameTableCompent.getSymbolNode(0,2,0);
                        // let symbolNode21 = this.m_gameTableCompent.getSymbolNode(0,2,1);
                        // let symbolNode22 = this.m_gameTableCompent.getSymbolNode(0,2,2);
                        // let symbolNode30 = this.m_gameTableCompent.getSymbolNode(0,3,0);
                        // let symbolNode31 = this.m_gameTableCompent.getSymbolNode(0,3,1);
                        // let symbolNode32 = this.m_gameTableCompent.getSymbolNode(0,3,2);
                        // let symbolNode40 = this.m_gameTableCompent.getSymbolNode(0,4,0);
                        // let symbolNode41 = this.m_gameTableCompent.getSymbolNode(0,4,1);
                        // let symbolNode42 = this.m_gameTableCompent.getSymbolNode(0,4,2);
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
                        piaoNode.removeFromParent();
                        piaoNode.destroy();
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
}


