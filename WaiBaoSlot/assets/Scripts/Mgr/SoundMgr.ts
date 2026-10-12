import { _decorator, Component, Node, AudioSource, AudioClip, assert, game } from 'cc';
import { ResMgr } from './ResMgr';

const { ccclass, property } = _decorator;

type SfxItem = {
    source: AudioSource;
    node: Node;
    tag?: string;
};

@ccclass('SoundMgr')
export class SoundMgr extends Component {

    public static Instance: SoundMgr = null!;

    private m_bgmNode!: Node;
    private m_bgmAudioSource!: AudioSource;

    /** OneShot 音效池 */
    private m_sfxPool: SfxItem[] = [];
    private readonly MAX_SFX_COUNT: number = 10;

    /** Loop 音效（独立通道） */
    private m_loopSfxMap: Map<string, SfxItem> = new Map();

    private m_bgmVolume: number = 1.0;
    private m_sfxVolume: number = 1.0;

    protected onLoad(): void {
        if (SoundMgr.Instance) {
            this.node.destroy();
            return;
        }
        SoundMgr.Instance = this;

        this.initBgm();
        this.initSfxPool();
    }

    private initBgm() {
        this.m_bgmNode = new Node('BGM_AudioSource');
        this.m_bgmNode.parent = this.node;
        this.m_bgmAudioSource = this.m_bgmNode.addComponent(AudioSource);
        this.m_bgmAudioSource.loop = true;
        this.m_bgmAudioSource.volume = this.m_bgmVolume;
    }

    private initSfxPool() {
        for (let i = 0; i < this.MAX_SFX_COUNT; i++) {
            const node = new Node(`SFX_${i}`);
            node.parent = this.node;
            const source = node.addComponent(AudioSource);
            source.loop = false;
            source.volume = this.m_sfxVolume;

            this.m_sfxPool.push({ source, node });
        }
    }

    /* ==================== BGM ==================== */

    public playBGM(abName: string, bgmPath: string, volume?: number): void {
        const clip = ResMgr.Instance.getAsset(abName, bgmPath, AudioClip);
        assert(clip != null, `BGM not found: ${abName}/${bgmPath}`);

        this.m_bgmAudioSource.clip = clip;
        this.m_bgmAudioSource.volume = volume ?? this.m_bgmVolume;
        this.m_bgmAudioSource.play();
    }

    public stopBGM(): void {
        this.m_bgmAudioSource.stop();
        this.m_bgmAudioSource.clip = null;
    }

    public setBGMVolume(volume: number): void {
        this.m_bgmVolume = this.clampVolume(volume);
        this.m_bgmAudioSource.volume = this.m_bgmVolume;
    }

    /* ==================== LOOP SFX ==================== */

    /**
     * 播放 Loop 音效（推荐用于背景音效）
     */
    public playLoopSound(
        abName: string,
        sfxPath: string,
        tag: string,
        volume?: number
    ): AudioSource {

        if (this.m_loopSfxMap.has(tag)) {
            return this.m_loopSfxMap.get(tag)!.source;
        }

        const clip = ResMgr.Instance.getAsset(abName, sfxPath, AudioClip);
        assert(clip != null, `Loop SFX not found: ${abName}/${sfxPath}`);

        const node = new Node(`LoopSFX_${tag}`);
        node.parent = this.node;
        const source = node.addComponent(AudioSource);

        source.clip = clip;
        source.loop = true;
        source.volume = volume ?? this.m_sfxVolume;
        source.play();

        this.m_loopSfxMap.set(tag, { source, node, tag });
        return source;
    }

    public stopLoopSound(tag: string): void {
        const item = this.m_loopSfxMap.get(tag);
        if (!item) return;

        item.source.stop();
        item.source.clip = null;
        item.node.destroy();
        this.m_loopSfxMap.delete(tag);
    }

    /* ==================== ONESHOT SFX ==================== */

    public playSound(
        abName: string,
        sfxPath: string,
        volume?: number,
        loop: boolean = false
    ): AudioSource {

        // loop 音效走独立通道
        if (loop) {
            return this.playLoopSound(abName, sfxPath, sfxPath, volume);
        }

        const item = this.getIdleSfxItem();
        if (!item) {
            console.warn(`SFX pool full, ignore: ${sfxPath}`);
            return null!;
        }

        const clip = ResMgr.Instance.getAsset(abName, sfxPath, AudioClip);
        assert(clip != null, `SFX not found: ${abName}/${sfxPath}`);

        item.source.clip = clip;
        item.source.volume = volume ?? this.m_sfxVolume;
        item.source.loop = false;
        item.tag = sfxPath;

        item.node.once(AudioSource.EventType.ENDED, () => {
            item.source.clip = null;
        });

        item.source.play();
        return item.source;
    }

    public playSoundWithCallback(
        abName: string,
        sfxPath: string,
        callback: () => void,
        volume?: number,
        loop: boolean = false
    ): void {

        const item = this.getIdleSfxItem();
        if (!item) return;

        const clip = ResMgr.Instance.getAsset(abName, sfxPath, AudioClip);
        assert(clip != null, `SFX not found: ${abName}/${sfxPath}`);

        item.node.off(AudioSource.EventType.ENDED);
        item.node.once(AudioSource.EventType.ENDED, () => {
            callback();
            item.source.clip = null;
        });

        item.source.clip = clip;
        item.source.volume = volume ?? this.m_sfxVolume;
        item.source.loop = loop;
        item.tag = sfxPath;

        item.source.play();
    }

    public stopSoundByPath(sfxPath: string): void {
        for (const item of this.m_sfxPool) {
            if (item.tag === sfxPath && item.source.playing) {
                item.source.stop();
                item.source.clip = null;
            }
        }
    }

    public stopAllSound(): void {
        this.m_sfxPool.forEach(i => {
            i.source.stop();
            i.source.clip = null;
        });

        this.m_loopSfxMap.forEach(i => {
            i.source.stop();
            i.source.clip = null;
            i.node.destroy();
        });
        this.m_loopSfxMap.clear();
    }

    public setAllSoundVolume(volume: number): void {
        volume = this.clampVolume(volume);
        this.m_sfxVolume = volume;

        this.m_sfxPool.forEach(i => i.source.volume = volume);
        this.m_loopSfxMap.forEach(i => i.source.volume = volume);
    }

    private getIdleSfxItem(): SfxItem | null {
        for (const item of this.m_sfxPool) {
            if (!item.source.playing) return item;
        }
        return null;
    }

    private clampVolume(v: number): number {
        return Math.max(0, Math.min(1, v));
    }

    onDestroy(): void {
        this.stopBGM();
        this.stopAllSound();
        SoundMgr.Instance = null;
    }
}