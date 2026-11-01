
import { _decorator, Component, Node, Prefab,assetManager,JsonAsset,resources,instantiate } from 'cc';

import { ResMgr } from './Mgr/ResMgr';
import { UIMgr } from './Mgr/UIMgr';
import { SymbolMgr } from "./Mgr/SymbolMgr"
import { GlEventMgr } from './Mgr/GlEventMgr';
import { LevelMgr } from './Mgr/LevelMgr';
import { PlayerMgr } from './Mgr/PlayerMgr';
import { SoundMgr } from './Mgr/SoundMgr';
import { Utils } from './Util/Utils';
import { CKGameCenter } from './Mgr/CKGameCenter';

import { UILevelLoading_Ctrl } from './Views/UILevelLoading_Ctrl';
import { GameManager } from './Mgr/GameManager';
import { LevelConfig } from './InterFace/LevelConfig';
import { SceneOrientation } from './Views/SceneOrientation';
import { ScreenManager } from './Mgr/ScreenManager';

const { ccclass, property } = _decorator;

@ccclass('GameLanch')
export class GameLanch extends Component {

    protected onLoad(): void {
        if (!GameManager || !GameManager.instance){
            this.node.addComponent( GameManager );
        }
        // 初始化一些基本模块
        this.node.addComponent( UIMgr );
        // this.node.addComponent( ResMgr );
        // this.node.addComponent( GlEventMgr );
        // this.node.addComponent( LevelMgr );
        // this.node.addComponent( SoundMgr );
        // this.node.addComponent( Utils );
        this.node.addComponent( CKGameCenter );
    }

    start() {
        // 检查游戏更新...


        // 更新完毕之后 加载基本模块
        this.node.addComponent( SymbolMgr );
        this.node.addComponent( PlayerMgr );

        // 加载游戏的Loading
        resources.load("Main/Prefabs/UILevelLoading",Prefab,(err,prefab:Prefab)=>{
            if (err) {
                console.error('加载Main/Prefabs/UILevelLoading预制体失败失败:', err);
                return;
            }

            const prefabNode = instantiate(prefab);
            if (!prefabNode) {
                console.error('UILevelLoading预制体实例化失败');
                return;
            }
            this.node.addChild( prefabNode );
            // 添加组件
            let compent:UILevelLoading_Ctrl = prefabNode.addComponent("UILevelLoading_Ctrl") as UILevelLoading_Ctrl;
            // compent.initLoading("config/LevelConfig4");
            let levelID = 4;
            let levelConfig = "config/LevelConfig" + levelID;
            if (GameManager.instance.getGameStartLobbyFlag() == true){
                if (GameManager && GameManager.instance && GameManager.instance.getNextLevelID() != 0){
                    levelConfig = "config/LevelConfig" + GameManager.instance.getNextLevelID();
                }
                compent.initLoading(levelConfig);
            }else{
                let levelStr = "level" + levelID;
                // 异步加载
                resources.load("config/LevelConfig", JsonAsset, (err, jsonAsset: JsonAsset) => {
                    if (err) {
                        console.error('====>加载JSON失败:', err);
                        return;
                    }
                                    
                    const jsonData = jsonAsset.json as LevelConfig;
                    let levelInfo = jsonData[levelStr];
                    let compentSceneOrientation = this.node.getComponent(SceneOrientation);
                    if (levelInfo && compentSceneOrientation){
                        let isPortrait = levelInfo.isPortrait || false;
                        ScreenManager.instance.add("",isPortrait)
                    }
                    compent.initLoading(levelConfig);
                });
            }
            

                


            
        });
    }

    update(deltaTime: number) {
        
    }
}


