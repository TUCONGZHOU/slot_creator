
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

const { ccclass, property } = _decorator;

@ccclass('GameLanch')
export class GameLanch extends Component {

    protected onLoad(): void {
        // 初始化一些基本模块
        this.node.addComponent( UIMgr );
        this.node.addComponent( ResMgr );
        this.node.addComponent( GlEventMgr );
        this.node.addComponent( LevelMgr );
        this.node.addComponent( SoundMgr );
        this.node.addComponent( Utils );
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
            compent.initLoading("config/LevelConfig6");
        });
    }

    update(deltaTime: number) {
        
    }
}


