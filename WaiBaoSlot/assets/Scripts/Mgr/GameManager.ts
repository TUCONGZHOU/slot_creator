import { _decorator, assetManager, Component, director, Node } from 'cc';
import { SoundMgr } from './SoundMgr';
import { ResMgr } from './ResMgr';
import { UIMgr } from './UIMgr';
import { GlEventMgr } from './GlEventMgr';
import { LevelMgr } from './LevelMgr';
import { Utils } from '../Util/Utils';
import { ScreenManager } from './ScreenManager';
import { DebugLog } from '../Util/DebugLog';
const { ccclass, property } = _decorator;

export enum SceneType {
    LOBBY = 0,
    LEVEL  = 1,
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

        this.node.addComponent( ScreenManager );
        // this.node.addComponent( UIMgr );
        this.node.addComponent( ResMgr );
        this.node.addComponent( GlEventMgr );
        this.node.addComponent( LevelMgr );
        this.node.addComponent( SoundMgr );
        this.node.addComponent( Utils );
        
    }

    start() {
        console.log('GameManager 初始化完成');
    }
    public setGameStartLobbyFlag(){
        this.m_gameStartLobby = true;
    }
    public getGameStartLobbyFlag(){
        return this.m_gameStartLobby;
    }
    // 示例业务方法
    public setNextLevelID( levelID: number) {
        this.m_nextLevelId = levelID;
    }
    public getNextLevelID(){
        return this.m_nextLevelId;
    }
    public setCurLevelID( levelID: number) {
        this.m_curLevelId = levelID;
    }
    public getCurLevelID(){
        return this.m_curLevelId;
    }
    public setLastLevelID( levelID: number) {
        this.m_lastLevelId = levelID;
    }
    public getLastLevelID(){
        return this.m_lastLevelId;
    }
    public setNextSceneType( type:SceneType ){
        this.m_nextSceneType = type;
    }
    public getNextSceneType(){
        return this.m_nextSceneType;
    }
    public setCurSceneType( type:SceneType ){
        this.m_curSceneType = type;
    }
    public getCurSceneType(){
        return this.m_curSceneType;
    }
    public setLastBundleName( name:string ){
        this.m_lastBundleName = name;
    }
    public getLastBundleName(){
        return this.m_lastBundleName;
    }


    public changeToLobbyScene(){
        this.setNextSceneType(SceneType.LOBBY);
        this.changeSceneByType(false);
    }
    public changeToNewLevelSceneById( levelID: number,isPortrait:boolean ){
        this.setNextLevelID( levelID );
        this.setNextSceneType(SceneType.LEVEL);
        // 从 Lobby 进关卡时，先移除旧关卡 bundle，强制重新加载 spine 资源
        const oldBundle = this.m_lastBundleName;
        if (oldBundle && oldBundle !== "GameMain") {
            console.log(`[GameManager] 进关卡前移除旧 bundle: ${oldBundle}`);
            const bundle = assetManager.getBundle(oldBundle);
            if (bundle) {
                assetManager.removeBundle(bundle);
            }
        }
        this.changeSceneByType(isPortrait);
    }
    public changeSceneByType(isPortrait:boolean = false){
        if (this.getNextSceneType() == SceneType.LOBBY){
            director.loadScene('LobbyScene', (err)=>{
                if(err) DebugLog.log("GameManager", "LobbyScene 加载失败: "+err);
                else DebugLog.log("GameManager", "LobbyScene 加载成功");
            });
        }else if(this.getNextSceneType() == SceneType.LEVEL){
            let sceneName = isPortrait ? 'MainScceneP' : 'MainSccene';
            director.loadScene(sceneName, (err)=>{
                if(err) DebugLog.log("GameManager", `${sceneName} 加载失败: ${err}`);
                else DebugLog.log("GameManager", `${sceneName} 加载成功`);
            });
        }
    }
    

}