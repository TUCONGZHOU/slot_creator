

import { _decorator, Component, Node, resources, JsonAsset, Prefab, ProgressBar, find, view, Vec3, screen } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../Mgr/UIMgr';
import { ResMgr } from '../Mgr/ResMgr';
import { SymbolMgr } from "../Mgr/SymbolMgr";
import { LevelMgr } from '../Mgr/LevelMgr';
import { LevelConfig } from '../InterFace/LevelConfig';
import { UILayer } from '../Mgr/UIMgr';
import { GameTopNode_Ctrl } from './GameTopNode_Ctrl';
import { GameBottomNode_Ctrl } from './GameBottomNode_Ctrl';
import { ScreenManager } from '../Mgr/ScreenManager';
import { GameManager } from '../Mgr/GameManager';

@ccclass('UILevelLoading_Ctrl')
export class UILevelLoading_Ctrl extends UICtrl {

    private progressBar: ProgressBar = null;

    /**
    * 初始化视图
    */
    protected initView(): void {
        // 初始化进度条
        const progressBarNode = this.view["ProgressBar"];
        if (progressBarNode) {
            this.progressBar = progressBarNode.getComponent(ProgressBar);
            if (this.progressBar) {
                this.progressBar.progress = 0;
            } else {
                console.warn("[UILevelLoading_Ctrl] ProgressBar节点没有ProgressBar组件");
            }
        } else {
            console.warn("[UILevelLoading_Ctrl] 未找到 ProgressBar 节点");
        }
    }

    start() {

    }


    public initLoading(jsonPath: string): void {
        // 异步加载
        resources.load(jsonPath, JsonAsset, (err, jsonAsset: JsonAsset) => {
            if (err) {
                console.error('====>加载JSON失败:', err);
                return;
            }

            const jsonData = jsonAsset.json as LevelConfig;
            LevelMgr.Instance.setLevelConfigAndModel(jsonData);


            this.loadRes(jsonData);
        });
    }

    private loadRes(jsonData: LevelConfig): void {
        // 要初始化的ab包的名字
        let abName = jsonData.BundleName;
        // 要添加的预制体
        let prefabs: string[] = [];
        // 主界面
        if (jsonData.MainPrefabs !== "") {
            prefabs.push(jsonData.MainPrefabs);
        }
        // 背景
        if (jsonData.BgPrefabs !== "" && jsonData.BgPrefabs != undefined) {
            prefabs.push(jsonData.BgPrefabs);
        }
        // 普通轮盘
        if (jsonData.GameTable.NormalGameTable !== null && jsonData.GameTable.NormalGameTable != undefined) {
            prefabs.push(jsonData.GameTable.NormalGameTable.Prefabs);
        }
        // RespinGameTable
        if (jsonData.GameTable.RespinGameTable !== null && jsonData.GameTable.RespinGameTable != undefined) {
            prefabs.push(jsonData.GameTable.RespinGameTable.Prefabs);
        }
        if (jsonData.GameTable.RespinGameTable2 !== null && jsonData.GameTable.RespinGameTable2 != undefined) {
            prefabs.push(jsonData.GameTable.RespinGameTable2.Prefabs);
        }
        // FreeSpinGameTable
        if (jsonData.GameTable.FreeSpinGameTable !== null && jsonData.GameTable.FreeSpinGameTable != undefined) {
            prefabs.push(jsonData.GameTable.FreeSpinGameTable.Prefabs);
        }

        // ReelTable
        if (jsonData.ReelTable.NormalReelTable !== null && jsonData.ReelTable.NormalReelTable != undefined) {
            prefabs.push(jsonData.ReelTable.NormalReelTable.Prefabs);
        }
        if (jsonData.ReelTable.RespinReelTable !== null && jsonData.ReelTable.RespinReelTable != undefined) {
            prefabs.push(jsonData.ReelTable.RespinReelTable.Prefabs);
        }
        if (jsonData.ReelTable.FreeSpinReelTable !== null && jsonData.ReelTable.FreeSpinReelTable != undefined) {
            prefabs.push(jsonData.ReelTable.FreeSpinReelTable.Prefabs);
        }

        // 其他的预制体
        for (const value of jsonData.OtherPrefabs) {
            prefabs.push(value);
        }


        // 信号快
        let symbol = jsonData.Symbol;
        for (const key in symbol) {
            prefabs.push(symbol[key].file);
        }

        // 特效
        let effect = jsonData.Effect;
        for (const value of effect) {
            prefabs.push(value.file);
        }

        // 封装一个resPkg 
        let resPkg = {};
        // 关卡的ab包
        resPkg[abName] = {}
        // resPkg[abName].assetType = Prefab; // 预制体
        resPkg[abName].urls = [];
        for (const key in prefabs) {
            resPkg[abName].urls.push(prefabs[key]);
        }
        resPkg[abName].sounds = []; // 音效
        // for...in 遍历 键值对
        for (const key in jsonData.SoundsFile) {
            // 确保只遍历对象自身的属性
            if (jsonData.SoundsFile.hasOwnProperty(key)) {
                const value = jsonData.SoundsFile[key];
                resPkg[abName].sounds.push(value);
            }
        }
        // 连线音效 SoundsLineFile
        for (const value of jsonData.SoundsLineFile) {
            resPkg[abName].sounds.push(value);
        }

        resPkg[abName].sprites = []; // 音效
        for (const value of jsonData.SpriteFrame) {
            resPkg[abName].sprites.push(value);
        }

        // GameMain的ab包
        resPkg["GameMain"] = {}
        // resPkg["GameMain"].assetType = Prefab;
        resPkg["GameMain"].urls = [
            "Prefabs/GameBottomNode",
            "Prefabs/GameTopNode",
            "Prefabs/GameBottomNodeL",
            "Prefabs/GameTopNodeL",
            "Prefabs/SpinBtnP",
            "Prefabs/BigWin_P",
            "Prefabs/GetCoin",
        ];
        resPkg["GameMain"].sounds = [
            "Sounds/bigWin",
            "Sounds/bigwinner",
            "Sounds/btnClick"
        ];
        resPkg["GameMain"].sprites = [

        ];

        ResMgr.Instance.preLoadResPkg(resPkg, (curNum: number, totalNUm: number) => {
            const progress = curNum / totalNUm;
            // 显示加载进度
            this.progressBar.progress = progress * 0.5; // 包的加载给50%
        }, () => {
            // 创建缓存信号块
            SymbolMgr.Instance.initSymbolCache(jsonData, (curNum: number, totalNUm: number) => {
                // 显示加载进度
                const progress = (curNum / totalNUm) * 0.5;
                this.progressBar.progress = 0.5 + progress
            }, () => {
                // 加载调试数据 然后进入关卡
                this.loadTestSpinData(jsonData);
            });
        });
    }

    // 这里加载调试数据
    public loadTestSpinData(levelConfig: any) {
        let spinJsonPath: string[] = levelConfig.SpinJson;
        // 读取测试数据
        LevelMgr.Instance.loadTestSpinData(spinJsonPath, () => {
            // 读取default.json的初始化数据
            LevelMgr.Instance.requestEnterGame(1, levelConfig.BundleName, () => {
                this.enterLevelGame(levelConfig.BundleName);
            });
        });
    }

    public enterLevelGame(abName: string) {
        // 游戏主体
        const targetNode = find("Canvas/MiddleNode");
        // 加载完毕 进入关卡 创建游戏的主界面
        if (abName == "LevelTR") {
            UIMgr.Instance.showUi(abName, "Prefabs/MainUI", "LevelTR_MainUI_Ctrl", UILayer.Normal, targetNode);
        }
        else if (abName == "LevelJT") {
            UIMgr.Instance.showUi(abName, "Prefabs/MainUI", "LevelJT_MainUI_Ctrl", UILayer.Normal, targetNode);
        }
        else {
            console.warn("[UILevelLoading_Ctrl] 未知关卡:", abName);
        }

        // // 加载GameTopNode
        // UIMgr.Instance.showUi("GameMain","Prefabs/GameTopNode","GameTopNode_Ctrl",UILayer.Normal);
        this.initTopNode();
        // // 加载GameBottomNode
        // UIMgr.Instance.showUi("GameMain","Prefabs/GameBottomNode","GameBottomNode_Ctrl",UILayer.Normal);
        this.initBottomNode();

        GameManager.instance.setLastBundleName(abName);

        // 移除自己
        this.node.destroy();
    }

    public initTopNode(): void {

        // 加载GameTopNode
        const targetNode = find("Canvas/TopNode");
        if (ScreenManager.instance.getCurScreenValue() == true) {
            UIMgr.Instance.showUi("GameMain", "Prefabs/GameTopNode", "GameTopNode_Ctrl", UILayer.Normal, targetNode);
        } else {
            UIMgr.Instance.showUi("GameMain", "Prefabs/GameTopNodeL", "GameTopNode_Ctrl", UILayer.Normal, targetNode);
        }

        // const uiTopRoot = targetNode;
        // const visibleSize = view.getVisibleSize();
        // const designW = 768;
        // // 计算当前实际可见设计宽度
        // const scaleX = visibleSize.width / designW;
        // uiTopRoot.setScale(new Vec3(scaleX, scaleX, 1));
    }

    public initBottomNode(): void {
        // 加载GameTopNode
        const targetNode = find("Canvas/BottomNode");
        if (ScreenManager.instance.getCurScreenValue() == true) {
            UIMgr.Instance.showUi("GameMain", "Prefabs/GameBottomNode", "GameBottomNode_Ctrl", UILayer.Normal, targetNode);
        } else {
            UIMgr.Instance.showUi("GameMain", "Prefabs/GameBottomNodeL", "GameBottomNode_Ctrl", UILayer.Normal, targetNode);
        }

        // const uiBottomRoot = targetNode;
        // const visibleSize = view.getVisibleSize();
        // const designW = 768;
        // // 计算当前实际可见设计宽度
        // const scaleX = visibleSize.width / designW;
        // uiBottomRoot.setScale(new Vec3(scaleX, scaleX, 1));
    }

    update(deltaTime: number) {

    }

    /**
     * 销毁时清理
     */
    protected onDestroy(): void {
        // 调用父类onDestroy
        super.onDestroy();
    }
}


