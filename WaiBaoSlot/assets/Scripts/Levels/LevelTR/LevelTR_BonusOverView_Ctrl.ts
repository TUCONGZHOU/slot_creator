import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { UICtrl, UIMgr } from '../../Mgr/UIMgr';
import { LevelMgr } from '../../Mgr/LevelMgr';
import { Utils } from '../../Util/Utils';
import { SoundMgr } from '../../Mgr/SoundMgr';
import { LevelConfig } from '../../InterFace/LevelConfig';
import { GlEventMgr } from '../../Mgr/GlEventMgr';
import { EventName } from '../../Mgr/EventName';

@ccclass('LevelTR_BonusOverView_Ctrl')
export class LevelTR_BonusOverView_Ctrl extends UICtrl {

    public m_levelConfig: LevelConfig = null;

    public m_soundFile: string = null;

    protected initView(): void {
        this.addButtonClick("SpriteSplash1", this, this.clickBonusView);
    }

    start() {

    }

    update(deltaTime: number) {

    }

    public clickBonusView(): void {
        // 停止音效
        if (this.m_soundFile) {
            SoundMgr.Instance.stopSoundByPath(this.m_soundFile);
        }
        // 关闭
        UIMgr.Instance.closeUi("LevelTR_BonusOverView_Ctrl");
        // 关闭
        UIMgr.Instance.closeUi("LevelTR_BonusStartView_Ctrl");
        // 恢复点击
        GlEventMgr.Instance.emit(EventName.RecoverSpinBtn)

        // 发送消息 金币滚动
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        GlEventMgr.Instance.emit(EventName.StartAmountScroll, 0, winNum, 5);
        // 发送消息增长进度条
        GlEventMgr.Instance.emit(EventName.StartProgressBarAnim, 0, 1, 5, "ShowSpinBtn");
    }

    public initUI(levelConfig: LevelConfig, bonusName: string) {
        this.m_levelConfig = levelConfig;
        const lbWin = this.view["lb_win"].getComponent(Label);
        const winNum = LevelMgr.Instance.getLevelModel().getWinAmount();
        let coin = Utils.util_formatCoins(winNum, 6);
        lbWin.string = coin.toString();

        this.view["GrandPanel"].active = false;
        this.view["MajorPanel"].active = false;
        this.view["MinorPanel"].active = false;
        this.view["MiniPanel"].active = false;

        let soundFile = null;
        if (bonusName == "Grand") {
            this.view["GrandPanel"].active = true;
            soundFile = this.m_levelConfig.SoundsFile["GrandBonus"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
        }
        else if (bonusName == "Major") {
            this.view["MajorPanel"].active = true;
            soundFile = this.m_levelConfig.SoundsFile["MajorBonus"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
        }
        else if (bonusName == "Minor") {
            this.view["MinorPanel"].active = true;
            soundFile = this.m_levelConfig.SoundsFile["MinorBonus"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
        }
        else if (bonusName == "Mini") {
            this.view["MiniPanel"].active = true;
            soundFile = this.m_levelConfig.SoundsFile["MiniBonus"];
            if (soundFile) {
                SoundMgr.Instance.playSound(this.m_levelConfig.BundleName, soundFile);
            }
        }

        this.m_soundFile = soundFile;
    }

}


