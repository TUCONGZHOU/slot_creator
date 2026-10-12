import { _decorator, Component, instantiate, Node, Prefab, sp, tween } from 'cc';
import { BaseGameMain } from '../../GameBase/BaseGameMain';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { ActionType, LevelConfig } from '../../InterFace/LevelConfig';
import { UICtrl, UILayer, UIMgr } from '../../Mgr/UIMgr';
import { LevelCK_FreeSpinView_Ctrl } from './LevelCK_FreeSpinView_Ctrl';
import { LevelCK_NormalReelTable_Ctrl } from './LevelCK_NormalReelTable_Ctrl';
import { LevelCK_ReSpinEnterAction_Ctrl } from './LevelCK_ReSpinEnterAction_Ctrl';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';
import { Utils } from '../../Util/Utils';
import { ResMgr } from '../../Mgr/ResMgr';
import { LevelCK_ReStartInfoNode_Ctrl } from "./LevelCK_ReStartInfoNode_Ctrl"
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelCK_PayTable_Ctrl } from './LevelCK_PayTable_Ctrl';

const { ccclass, property } = _decorator;

@ccclass('LevelCK_MainUI_Ctrl')
export class LevelCK_MainUI_Ctrl extends BaseGameMain {
    
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
        let nextAction = LevelMgr.Instance.getLevelModel().getNextAction();
        if (action == ActionType.NORMAL){
            // 根据数据显示轮盘上的信号块 显示Normal轮盘 
            this.addNormalGameTableUI();
            if (nextAction == ActionType.FREESPIN){
                //  让SpinBtn按钮不能点击
                GlEventMgr.Instance.emit( EventName.EnabledSpinBtn,false )
                Utils.performWithDelay(this.node,()=>{
                    // 触发freespin的界面和轮盘切换
                    this.enterFreeSpin();
                },1)
            }else if (nextAction == ActionType.RESPIN){
                //  让SpinBtn按钮不能点击
                GlEventMgr.Instance.emit( EventName.EnabledSpinBtn,false )
                Utils.performWithDelay(this.node,()=>{
                    // 触发respin的界面和轮盘切换
                    this.enterReSpin();
                },1)
            }
        }
        else if (action == ActionType.FREESPIN){
            // 显示freespin的轮盘
            this.addFreeSpinGameTableUI();
            if (nextAction == ActionType.NORMAL){
                //  让SpinBtn按钮不能点击
                GlEventMgr.Instance.emit( EventName.EnabledSpinBtn,false )
                Utils.performWithDelay(this.node,()=>{
                    // 触发normal的界面和轮盘切换
                    this.enterNormal();
                },1)
            }
        }
        else if (action == ActionType.RESPIN){
            // 显示respin的轮盘
            this.addRespinGameTableUI();
            if (nextAction == ActionType.NORMAL){
                Utils.performWithDelay(this.node,()=>{
                    // 触发normal的界面和轮盘切换
                    this.enterNormal();
                },1)
            }
        }
    }

    // public enterNormal():void{
    //     const anims: Array<ReturnType<typeof tween>> = [];
    //     anims.push(
    //         tween(this.node).delay(1)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // 播放音效
    //             let soundFile = this.m_levelConfig.SoundsFile["EnterNormal"];
    //             if (soundFile){
    //                 SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    //             }

    //             let prefab = ResMgr.Instance.getAsset(this.m_abName,"Prefabs/Guang",Prefab);
    //             if(prefab){
    //                 let spineGuang = instantiate(prefab);
    //                 this.view["NodeGuang"].addChild(spineGuang);
    //                 let spine = spineGuang.getComponent(sp.Skeleton) as sp.Skeleton;
    //                 spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
    //                     spine.setCompleteListener(null); // 清除监听器
    //                     // 移除当前轮盘
    //                     this.removeGameTable();
    //                     // 添加normal的轮盘
    //                     this.addNormalGameTableUI();
    //                     // 恢复点击
    //                     GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
    //                     // 发送消息
    //                     GlEventMgr.Instance.emit(EventName.ClearWinAmount);
    //                 });
    //                 spine.setAnimation(0,"Game1-guang",false);
    //             }
    //         })
    //     );
    //     tween(this.node).sequence(...anims).start();
    // }

    public async enterNormal(): Promise<void> {
        try {
            // 1. 延迟 1 秒
            await this.delay(1);

            // 2. 播放音效
            const soundFile = this.m_levelConfig.SoundsFile["EnterNormal"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }

            // 3. 加载光效 prefab 并播放动画
            const prefab = ResMgr.Instance.getAsset(this.m_abName, "Prefabs/Guang", Prefab);
            if (prefab) {
                const spineGuang = instantiate(prefab);
                this.view["NodeGuang"].addChild(spineGuang);
                const spine = spineGuang.getComponent(sp.Skeleton) as sp.Skeleton;

                // 等待 spine 动画播放完成（await 等待）
                await this.waitSpineAnimationComplete(spine, 0, "Game1-guang", false);

                // 4. 动画结束后执行逻辑
                this.removeGameTable();
                this.addNormalGameTableUI();
                GlEventMgr.Instance.emit(EventName.RecoverSpinBtn);
                GlEventMgr.Instance.emit(EventName.ClearWinAmount);
            }
        } catch (err) {
            console.error("enterNormal 执行异常:", err);
            throw err;
        }
    }

    /**
     * 等待 Spine 动画播放完成
     * @param spine 动画组件
     * @param trackIndex 轨道
     * @param animName 动画名
     * @param loop 是否循环
     */
    private waitSpineAnimationComplete(spine: sp.Skeleton,
        trackIndex: number,
        animName: string,
        loop: boolean
    ): Promise<void> {
        return new Promise(resolve => {
            spine.setCompleteListener((entry: sp.spine.TrackEntry) => {
                spine.setCompleteListener(null); // 立即清空监听，防止内存泄漏
                resolve();
            });
            spine.setAnimation(trackIndex, animName, loop);
        });
    }

    // // 进入freespin
    // public enterFreeSpin():void{
    //     const anims: Array<ReturnType<typeof tween>> = [];
    //     // 要播放scatter的动画 
    //     let freeSpinCtrl:LevelCK_FreeSpinView_Ctrl = null;
    //     anims.push(
    //         tween(this.node).delay(1)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             this.m_gameTableCompent.stopGameTableLineAction();
    //             this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
    //             // -- 音效
    //             let soundFile = this.m_levelConfig.SoundsFile["FreeSpinInner"];
    //             if (soundFile){
    //                 SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    //             }
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(3)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // -- 音效
    //             let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
    //             if (soundFile){
    //                 SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    //             }
    //             // 显示freespin界面
    //             freeSpinCtrl = UIMgr.Instance.showUi("LevelCK","Prefabs/FreeSpinView","LevelCK_FreeSpinView_Ctrl",UILayer.Normal) as LevelCK_FreeSpinView_Ctrl;
    //             freeSpinCtrl.initUI( this.m_levelConfig );
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(3)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // 关闭freespin界面
    //             UIMgr.Instance.closeUi("LevelCK_FreeSpinView_Ctrl");
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(0.5)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // 播放关门的spine动画
    //             (this.m_gameTableCompent.getReelTableCompent(0) as LevelCK_NormalReelTable_Ctrl).addDoorSpineEffect();
    //             // -- 音效
    //             let soundFile = this.m_levelConfig.SoundsFile["Door"];
    //             if (soundFile){
    //                 SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    //             }
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(2)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // 移除当前轮盘
    //             this.removeGameTable();
    //             // 添加freespin的轮盘
    //             this.addFreeSpinGameTableUI();
    //             // 恢复点击
    //             GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
    //             // 发送消息
    //             GlEventMgr.Instance.emit(EventName.ClearWinAmount);
    //         })
    //     );
    //     tween(this.node).sequence(...anims).start();
    // }

    public async enterFreeSpin():Promise<void>{
        // 要播放scatter的动画 
        let freeSpinCtrl:LevelCK_FreeSpinView_Ctrl = null;
        
        try{
            // 1. 延时1秒
            await this.delay(1);
            // 2. 停止线动画 + 播放scatter动画 + 播放音效
            this.m_gameTableCompent.stopGameTableLineAction();
            this.m_gameTableCompent.getReelTableCompent(0).playAllScatterAction();
            let soundFile = this.m_levelConfig.SoundsFile["FreeSpinInner"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
            // 3. 延时3秒
            await this.delay(3);
            // 4. 播放音效 + 显示freespin界面
            soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
            freeSpinCtrl = UIMgr.Instance.showUi("LevelCK", "Prefabs/FreeSpinView", "LevelCK_FreeSpinView_Ctrl", UILayer.Normal) as LevelCK_FreeSpinView_Ctrl;
            freeSpinCtrl.initUI(this.m_levelConfig);
            // 5. 延时3秒
            await this.delay(3);
            // 6. 关闭freespin界面
            UIMgr.Instance.closeUi("LevelCK_FreeSpinView_Ctrl");
            // 7. 延时0.5秒
            await this.delay(0.5);
            // 8. 播放关门动画 + 音效
            (this.m_gameTableCompent.getReelTableCompent(0) as LevelCK_NormalReelTable_Ctrl).addDoorSpineEffect();
            soundFile = this.m_levelConfig.SoundsFile["Door"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
            // 9. 延时2秒
            await this.delay(2);
            // 10. 移除轮盘 + 添加freespin轮盘 + 恢复点击
            this.removeGameTable();
            this.addFreeSpinGameTableUI();
            GlEventMgr.Instance.emit(EventName.RecoverSpinBtn);
            GlEventMgr.Instance.emit(EventName.ClearWinAmount);
        }
        catch(err){
            console.error("enterReSpin执行异常:", err);
            throw err; // 向外抛出异常，与原 reject 行为一致
        }

    }

    // // 进入respin
    // public enterReSpin():void{
    //     const anims: Array<ReturnType<typeof tween>> = [];
    //     let reSpinEnterActionCtrl:LevelCK_ReSpinEnterAction_Ctrl = null;
    //     let reSpinInfoCtrl:LevelCK_ReStartInfoNode_Ctrl = null;
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // -- 音效 用freespin的音效
    //             let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
    //             if (soundFile){
    //                 SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    //             }
    //             // 播放动画
    //             this.m_gameTableCompent.getReelTableCompent(0).playAllBonusAction();
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(1)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             this.m_gameTableCompent.stopGameTableLineAction();
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // 显示respin start 界面
    //             reSpinEnterActionCtrl = (UIMgr.Instance.showUi("LevelCK","Prefabs/ReSpinEnterAction","LevelCK_ReSpinEnterAction_Ctrl",UILayer.Normal)) as LevelCK_ReSpinEnterAction_Ctrl;
    //             reSpinEnterActionCtrl.initUI(this.m_levelConfig)
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(1.5)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             try {
    //                 // 移除当前轮盘
    //                 this.removeGameTable();
    //                 // // 添加respin的轮盘
    //                 // this.addRespinGameTableUI();
    //                 // SoundMgr.Instance.setBGMVolume(0.01);
    //             }
    //             catch (e) {
    //                 console.error("addRespinGameTableUI crash:", e);
    //             }
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(0.2)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             try {
    //                 // 添加respin的轮盘
    //                 this.addRespinGameTableUI();
    //                 SoundMgr.Instance.setBGMVolume(0.01);
    //             }
    //             catch (e) {
    //                 console.error("addRespinGameTableUI crash:", e);
    //             }
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(2.0)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             // 关闭respin界面
    //             reSpinInfoCtrl = UIMgr.Instance.showUi("LevelCK","Prefabs/ReStartInfoNode","LevelCK_ReStartInfoNode_Ctrl",UILayer.Normal) as LevelCK_ReStartInfoNode_Ctrl;
    //             reSpinInfoCtrl.startAction( this.m_levelConfig );
    //             // -- 音效 用freespin的音效
    //             let soundFile = this.m_levelConfig.SoundsFile["ReSpinInfo"];
    //             if (soundFile){
    //                 SoundMgr.Instance.playSound( this.m_levelConfig.BundleName,soundFile );
    //             }
    //             SoundMgr.Instance.setBGMVolume(0.3);
    //         })
    //     );
    //     anims.push(
    //         tween(this.node).delay(3)
    //     );
    //     anims.push(
    //         tween(this.node).call(()=>{
    //             SoundMgr.Instance.setBGMVolume(0.5);
    //             // 关闭freespin界面
    //             UIMgr.Instance.closeUi("LevelCK_ReSpinEnterAction_Ctrl");
    //             UIMgr.Instance.closeUi("LevelCK_ReStartInfoNode_Ctrl");
    //             // 恢复点击
    //             GlEventMgr.Instance.emit( EventName.RecoverSpinBtn )
    //         })
    //     );
    //     tween(this.node).sequence(...anims).start();
    // }

    // 进入respin（修复崩溃 + 修复TS报错版本）
    public async enterReSpin(): Promise<void> {
        let reSpinEnterActionCtrl: LevelCK_ReSpinEnterAction_Ctrl = null;
        let reSpinInfoCtrl: LevelCK_ReStartInfoNode_Ctrl = null;

        try {
            // 1. 播放音效 + 轮盘动画
            let soundFile = this.m_levelConfig.SoundsFile["EnterFreeSpin"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
            this.m_gameTableCompent.getReelTableCompent(0).playAllBonusAction();
            // 2. 延时1秒
            await this.delay(1);
            // 3. 停止线动画
            this.m_gameTableCompent.stopGameTableLineAction();
            // 4. 显示respin start界面
            reSpinEnterActionCtrl = UIMgr.Instance.showUi("LevelCK", "Prefabs/ReSpinEnterAction", "LevelCK_ReSpinEnterAction_Ctrl", UILayer.Normal) as LevelCK_ReSpinEnterAction_Ctrl;
            if (reSpinEnterActionCtrl) {
                reSpinEnterActionCtrl.initUI(this.m_levelConfig);
            }
            // 5. 延时1.5秒
            await this.delay(1.5);
            // 6. 移除当前轮盘
            this.removeGameTable();
            // 8. 添加respin轮盘
            this.addRespinGameTableUI();
            SoundMgr.Instance.setBGMVolume(0.01);
            // 9. 延时2秒
            await this.delay(2.0);
            // 10. 显示respin信息界面
            reSpinInfoCtrl = UIMgr.Instance.showUi("LevelCK", "Prefabs/ReStartInfoNode", "LevelCK_ReStartInfoNode_Ctrl", UILayer.Normal) as LevelCK_ReStartInfoNode_Ctrl;
            reSpinInfoCtrl.startAction(this.m_levelConfig);
            // 音效
            soundFile = this.m_levelConfig.SoundsFile["ReSpinInfo"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
            SoundMgr.Instance.setBGMVolume(0.3);
            // 11. 延时3秒
            await this.delay(3);
            // 12. 收尾操作
            SoundMgr.Instance.setBGMVolume(0.5);
            UIMgr.Instance.closeUi("LevelCK_ReSpinEnterAction_Ctrl");
            UIMgr.Instance.closeUi("LevelCK_ReStartInfoNode_Ctrl");
            GlEventMgr.Instance.emit(EventName.RecoverSpinBtn);
        } catch (err) {
            console.error("enterReSpin执行异常:", err);
            throw err; // 向外抛出异常，与原 reject 行为一致
        }

    }

    public showPayInfo():void{
        UIMgr.Instance.showUi("LevelCK","Prefabs/PayTable","LevelCK_PayTable_Ctrl",UILayer.Normal);
    }
}


