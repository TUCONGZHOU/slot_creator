import { _decorator, Component, director, JsonAsset, native, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../Mgr/UIMgr';
import { GameManager } from '../Mgr/GameManager';
import { LevelConfig } from '../InterFace/LevelConfig';
import { ResMgr } from '../Mgr/ResMgr';
import { GlEventMgr } from '../Mgr/GlEventMgr';
import { LevelMgr } from '../Mgr/LevelMgr';
import { SoundMgr } from '../Mgr/SoundMgr';
import { Utils } from '../Util/Utils';

@ccclass('LobbyView')
export class LobbyView extends UICtrl {
    public onLoad(): void {
        super.onLoad();
        // 初始化一些基本模块
        this.node.addComponent(UIMgr);
        // this.node.addComponent( ResMgr );
        // this.node.addComponent( GlEventMgr );
        // this.node.addComponent( LevelMgr );
        // this.node.addComponent( SoundMgr );
        // this.node.addComponent( Utils );
    }
    protected initView(): void {
        // 场景中已移除选关按钮，由 start() 自动进入关卡
    }
    start() {
        // 自动进入 LevelTR，跳过选关
        this.chooseLevel(3);
    }

    update(deltaTime: number) {

    }

    public chooseLevel(levelId: number) {
        let levelConfig = "config/LevelConfig";
        let levelStr = "level" + levelId;
        // 异步加载
        resources.load(levelConfig, JsonAsset, (err, jsonAsset: JsonAsset) => {
            if (err) {
                console.error('====>加载JSON失败:', err);
                return;
            }

            const jsonData = jsonAsset.json as LevelConfig;
            let levelInfo = jsonData[levelStr]
            if (levelInfo) {
                let isPortrait = levelInfo.isPortrait || false;
                GameManager.instance.changeToNewLevelSceneById(levelId, isPortrait);
            }
        });

    }
}


