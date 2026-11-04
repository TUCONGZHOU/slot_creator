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

        GameManager.instance.setGameStartLobbyFlag(); // 启动lobbyscene的标记，主要处理兼容其他场景启动。
    }
    protected initView(): void {
        // throw new Error('Method not implemented.');
        for (let i = 1; i <= 5; i++) {
            this.addButtonClick("level" + i, this, () => this.chooseLevel(i));
        }
    }
    start() {
        console.log('游戏大厅场景==================')
        if (GameManager.instance.getLastBundleName() === "") {
            setTimeout(() => {
                this.chooseLevel(3);   // 想进第几关就改这里的数字
            }, 2000)
        }

    }

    update(deltaTime: number) {

    }

    public chooseLevel(levelId: number) {
        console.log(levelId, 'levelId');

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


