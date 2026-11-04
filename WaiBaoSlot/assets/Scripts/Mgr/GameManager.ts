import { _decorator, assetManager, Component, director, Node, sp } from 'cc';
import { SoundMgr } from './SoundMgr';
import { ResMgr } from './ResMgr';
import { UIMgr } from './UIMgr';
import { GlEventMgr } from './GlEventMgr';
import { LevelMgr } from './LevelMgr';
import { Utils } from '../Util/Utils';
import { ScreenManager } from './ScreenManager';
const { ccclass, property } = _decorator;

export enum SceneType {
    LOBBY = 0,
    LEVEL = 1,
}


@ccclass('GameManager')
export class GameManager extends Component {
    // 单例实例
    private static _instance: GameManager = null;

    public static get instance(): GameManager {
        return GameManager._instance;
    }

    public m_gameStartLobby = false; // 是否从lobby启动 // 


    private m_nextLevelId = 0;
    private m_curLevelId = 0;
    private m_lastLevelId = 0;
    private m_nextSceneType;
    private m_curSceneType = SceneType.LOBBY;
    private m_lastBundleName: string = "";

    onLoad() {
        // —— 关键：保证全游戏只有一份 ——
        if (GameManager._instance && GameManager._instance !== this) {
            // 第二次进入时，把重复的那个节点销毁掉
            this.node.destroy();
            return;
        }
        GameManager._instance = this;

        // —— 关键：标记为常驻根节点 ——
        // 注意：这个节点必须在场景层级的"根节点"上，否则 API 无效
        director.addPersistRootNode(this.node);

        this.node.addComponent(ScreenManager);
        // this.node.addComponent( UIMgr );
        this.node.addComponent(ResMgr);
        this.node.addComponent(GlEventMgr);
        this.node.addComponent(LevelMgr);
        this.node.addComponent(SoundMgr);
        this.node.addComponent(Utils);

    }

    start() {
        console.log('GameManager 初始化完成');
    }
    public setGameStartLobbyFlag() {
        this.m_gameStartLobby = true;
    }
    public getGameStartLobbyFlag() {
        return this.m_gameStartLobby;
    }
    // 示例业务方法
    public setNextLevelID(levelID: number) {
        this.m_nextLevelId = levelID;
    }
    public getNextLevelID() {
        return this.m_nextLevelId;
    }
    public setCurLevelID(levelID: number) {
        this.m_curLevelId = levelID;
    }
    public getCurLevelID() {
        return this.m_curLevelId;
    }
    public setLastLevelID(levelID: number) {
        this.m_lastLevelId = levelID;
    }
    public getLastLevelID() {
        return this.m_lastLevelId;
    }
    public setNextSceneType(type: SceneType) {
        this.m_nextSceneType = type;
    }
    public getNextSceneType() {
        return this.m_nextSceneType;
    }
    public setCurSceneType(type: SceneType) {
        this.m_curSceneType = type;
    }
    public getCurSceneType() {
        return this.m_curSceneType;
    }
    public setLastBundleName(name: string) {
        this.m_lastBundleName = name;
    }
    public getLastBundleName() {
        return this.m_lastBundleName;
    }


    public changeToLobbyScene() {
        this.setNextSceneType(SceneType.LOBBY);
        // 切场景前，清空所有 spine 组件的 skeletonData，防止 native use-after-free
        this.clearAllSpineData();
        this.changeSceneByType(false);
    }

    private clearAllSpineData(): void {
        const scene = director.getScene();
        if (!scene) return;
        const skeletons = scene.getComponentsInChildren(sp.Skeleton);
        for (let i = 0; i < skeletons.length; i++) {
            try {
                (skeletons[i] as any).skeletonData = null;
            } catch (e) { }
        }
    }

    public changeToNewLevelSceneById(levelID: number, isPortrait: boolean) {
        this.setNextLevelID(levelID);
        this.setNextSceneType(SceneType.LEVEL);
        // 从 Lobby 进关卡时，释放旧关卡 bundle，强制重新加载 spine 资源
        const oldBundle = this.m_lastBundleName;
        if (oldBundle && oldBundle !== "GameMain") {
            const bundle = assetManager.getBundle(oldBundle);
            if (bundle) {
                bundle.releaseAll();
                assetManager.removeBundle(bundle);
            }
        }
        this.changeSceneByType(isPortrait);
    }
    public changeSceneByType(isPortrait: boolean = false) {
        SoundMgr.Instance.stopBGM();
        if (this.getNextSceneType() == SceneType.LOBBY) {
            director.loadScene('LobbyScene', (err) => {
                if (err) console.error("LobbyScene 加载失败: " + err);
            });
        } else if (this.getNextSceneType() == SceneType.LEVEL) {
            LevelMgr.Instance.resetLevelTestValue();
            let sceneName = isPortrait ? 'MainScceneP' : 'MainSccene';
            director.loadScene(sceneName, (err) => {
                if (err) console.error(`${sceneName} 加载失败: ${err}`);
            });
        }
    }


}