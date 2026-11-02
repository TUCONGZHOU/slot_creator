
import { _decorator, Component, Node, instantiate, Prefab, assert, director } from 'cc';
import { UIMgr, UICtrl } from '../Mgr/UIMgr';
import { SymbolMgr } from '../Mgr/SymbolMgr';
import { ResMgr } from '../Mgr/ResMgr';
import { EventName } from '../Mgr/EventName';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { LevelMgr } from '../Mgr/LevelMgr';
import { BaseGameTable } from './BaseGameTable';
import { LevelConfig, GameTableConfig } from '../InterFace/LevelConfig';
import { SoundMgr } from '../Mgr/SoundMgr';

const { ccclass, property } = _decorator;

@ccclass('BaseGameMain')
export class BaseGameMain extends UICtrl {

    public m_levelConfig: LevelConfig = null;
    public m_abName: string = "";


    public m_gameTable: Node | null = null;
    public m_gameTableCompent: BaseGameTable = null;

    /**
     * 初始化视图
     */
    protected initView(): void {
        // 开始滚动
        GlEventMgr.Instance.on(EventName.StartRoll, this.startRoll, this);
        // 停止滚动
        GlEventMgr.Instance.on(EventName.StopRoll, this.stopRoll, this);
        // 显示PayInfo
        GlEventMgr.Instance.on(EventName.ShowPayInfo, this.showPayInfo, this);
    }

    onDestroy() {
        // 调用父类onDestroy，处理其他清理工作
        super.onDestroy();
    }

    start() {
        this.m_levelConfig = LevelMgr.Instance.getLevelConfig();
        this.m_abName = this.m_levelConfig.BundleName;
        this.addBgUI();
        this.changeGameTableByEnter();
    }

    update(deltaTime: number) {

    }

    // -------------- 子类可能需要重写的接口 -------------------- //
    // 轮盘切换 子类必须重写的接口
    public changeGameTableByEnter(): void {

    }

    public enterNormal(): void {

    }

    public enterFreeSpin(): void {

    }

    public enterReSpin(): void {

    }

    public enterBonus(): void {

    }

    // wild的飞行动画
    public wildFlyAction(col: number, row: number) {

    }

    // bonus的飞行动画
    public bonusFlyAction(col: number, row: number) {

    }

    // 显示payInfo 子类自己重写
    public showPayInfo(): void {

    }

    // -------------- 子类可能需要重写的接口 -------------------- //

    // 当前的GameTable滚动
    public startRoll(): void {
        console.log("开始旋转==BaseGameMain startRoll");
        this.m_gameTableCompent.startRoll();
    }

    // 当前的GameTable滚动
    public stopRoll(isQuickStop: boolean): void {
        this.m_gameTableCompent.stopRoll(isQuickStop);
    }

    public removeGameTable(): void {
        if (this.m_gameTable !== null) {
            // this.m_gameTable.removeFromParent();
            // this.m_gameTableCompent = null;

            // // 使用组件自带的 scheduleOnce，确保与当前组件生命周期绑定
            // this.scheduleOnce(() => {
            //     if (this.m_gameTable && this.m_gameTable.isValid) {
            //         this.m_gameTable.destroy();
            //     }
            //     this.m_gameTable = null;
            // }, 0); // 延迟一帧销毁

            this.m_gameTable.destroy();
        }
    }

    public hideGameTable(): void {
        if (this.m_gameTable !== null) {
            this.m_gameTable.active = false;
        }
    }

    // 添加背景
    public addBgUI(): void {
        if (this.m_levelConfig.BgPrefabs && this.view["BgNode"]) {
            let prefab = ResMgr.Instance.getAsset(this.m_abName, this.m_levelConfig.BgPrefabs, Prefab);
            if (prefab) {
                let bg_ui = instantiate(prefab);
                this.view["BgNode"].addChild(bg_ui);
                // 添加背景组件
                bg_ui.addComponent(this.m_levelConfig.BgCompent);
            }
        }
    }


    // 添加 GameTable
    public addGameTableUI(gameTableConfig: GameTableConfig, patentNode: Node): void {
        let prefab = ResMgr.Instance.getAsset(this.m_abName, gameTableConfig.Prefabs, Prefab);
        assert(prefab !== null, " =====> addGameTableUI prefab is null ");
        if (prefab !== null) {
            let gametable_ui = instantiate(prefab);
            patentNode.addChild(gametable_ui);
            const compent = gametable_ui.addComponent(gameTableConfig.Compent);
            this.m_gameTable = gametable_ui;
            this.m_gameTableCompent = compent as BaseGameTable;
            // 初始化参数
            this.m_gameTableCompent.initUI(this.m_levelConfig, gameTableConfig, this);
        }
    }

    // 加载普通轮盘
    public addNormalGameTableUI(): void {
        assert(this.view["NormalGame"] != null, "主界面中必须有NormalGame节点");
        if (this.view["NormalGame"]) {
            this.addGameTableUI(this.m_levelConfig.GameTable.NormalGameTable, this.view["NormalGame"]);
            // 加载轮盘信号块
            let viewSymbolData = LevelMgr.Instance.getLevelModel().getReelData();
            this.m_gameTableCompent.loadGameTableUI(viewSymbolData);

            SoundMgr.Instance.stopBGM();
            // 播放背景音乐
            let soundFile = this.m_levelConfig.SoundsFile["NormalBg"];
            if (soundFile && soundFile != "") {
                SoundMgr.Instance.playBGM(this.m_levelConfig.BundleName, soundFile, 0.5);
            }
        }
    }

    // 添加freespin轮盘
    public addFreeSpinGameTableUI(): void {
        assert(this.view["FreeSpinGame"] != null, "主界面中必须有FreeSpinGame节点");
        if (this.view["FreeSpinGame"]) {
            this.addGameTableUI(this.m_levelConfig.GameTable.FreeSpinGameTable, this.view["FreeSpinGame"]);
            // 加载轮盘信号块
            let viewSymbolData = LevelMgr.Instance.getLevelModel().getFreeSpinReelData();
            this.m_gameTableCompent.loadGameTableUI(viewSymbolData);

            SoundMgr.Instance.stopBGM();
            // 播放背景音乐
            let soundFile = this.m_levelConfig.SoundsFile["FreeSpinBg"];
            if (soundFile && soundFile != "") {
                SoundMgr.Instance.playBGM(this.m_levelConfig.BundleName, soundFile, 0.5);
            }
        }
    }

    // 添加respin轮盘
    public addRespinGameTableUI(): void {
        assert(this.view["ReSpinGame"] != null, "主界面中必须有ReSpinGame节点");
        if (this.view["ReSpinGame"]) {
            this.addGameTableUI(this.m_levelConfig.GameTable.RespinGameTable, this.view["ReSpinGame"]);
            // 加载轮盘信号块
            let viewSymbolData = LevelMgr.Instance.getLevelModel().getRespinReelData();
            this.m_gameTableCompent.loadGameTableUI(viewSymbolData);

            SoundMgr.Instance.stopBGM();
            // 播放背景音乐
            let soundFile = this.m_levelConfig.SoundsFile["ReSpinBg"];
            if (soundFile && soundFile != "") {
                SoundMgr.Instance.playBGM(this.m_levelConfig.BundleName, soundFile, 0.5);
            }
        }
    }
}


