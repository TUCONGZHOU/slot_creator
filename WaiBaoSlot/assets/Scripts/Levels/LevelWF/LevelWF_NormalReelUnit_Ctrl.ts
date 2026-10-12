import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

import { BaseReelUnit } from '../../GameBase/BaseReelUnit';

@ccclass('LevelWF_NormalReelUnit_Ctrl')
export class LevelWF_NormalReelUnit_Ctrl extends BaseReelUnit {
    
    protected initView(): void {
        super.initView();
    }

    start() {
        super.start();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
    }
}


