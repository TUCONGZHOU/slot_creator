import { _decorator, AssetManager, assetManager, Component, Node, Prefab, AudioClip, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;


/**
 * 资源包配置接口
 */
interface ResourcePackage {
    urls: string[];
    sounds: string[];
    sprites:string[];
}

/**
 * 预加载配置接口
 */
interface PreloadConfig {
    [bundleName: string]: ResourcePackage;
}


@ccclass('ResMgr')
export class ResMgr extends Component {
    public static Instance: ResMgr = null;

    // 资源加载统计
    private totalUrls: number = 0;
    private nowUrls: number = 0;
    private totalAb: number = 0;
    private nowAb: number = 0;

    // 回调函数
    private progressFun: ((loaded: number, total: number) => void) | null = null;
    private endFunc: (() => void) | null = null;
    private isLoaded: boolean = false;

    // AB包缓存
    private abBunds: Map<string, AssetManager.Bundle> = new Map();

    // 已加载资源缓存
    private loadedAssets: Map<string, { asset: any, type: any }> = new Map();


    protected onLoad(): void {
        if (ResMgr.Instance === null) {
            ResMgr.Instance = this;
        } else {
            this.node.destroy();
            return;
        }
    }


    /**
     * 预加载所有资源包
     */
    public preLoadResPkg(resPkg: PreloadConfig,progressFunc: (loaded: number, total: number) => void, endFunc: () => void): void {
        this.resetState();
        this.progressFun = progressFunc;
        this.endFunc = endFunc;

        for (const key in resPkg) {
            this.totalAb++;
            if (resPkg[key].urls) {
                this.totalUrls += resPkg[key].urls.length;
            }
            if (resPkg[key].sounds) {
                this.totalUrls += resPkg[key].sounds.length;
            }
        }

        console.log(`====>[ResMgr]: 开始预加载，共 ${this.totalAb} 个AB包，${this.totalUrls} 个资源`);

        for (const key in resPkg) {
            this.loadAssetsBundle(key, (success: boolean) => {
                this.nowAb++;
                if (!success) {
                    // bundle 加载失败，把它的资源数从 totalUrls 里扣掉，避免永远等不到
                    const failed = resPkg[key];
                    if (failed.urls) this.totalUrls -= failed.urls.length;
                    if (failed.sounds) this.totalUrls -= failed.sounds.length;
                    if (failed.sprites) this.totalUrls -= failed.sprites.length;
                    console.error(`[ResMgr] bundle ${key} 加载失败，已跳过其 ${this.totalUrls} 个待加载资源`);
                }
                if (this.nowAb === this.totalAb) {
                    this.loadAssetsInAssetsBundle(resPkg);
                }
            });
        }
    }


    /**
     * 重置加载状态
     */
    private resetState(): void {
        this.totalUrls = 0;
        this.nowUrls = 0;
        this.totalAb = 0;
        this.nowAb = 0;
        this.progressFun = null;
        this.endFunc = null;
        this.isLoaded = false;
    }


    /**
     * 加载AB包
     */
    private loadAssetsBundle(abName: string, endFunc: (success: boolean) => void): void {
        assetManager.loadBundle(abName, (err, bundle) => {
            if (err !== null) {
                console.error(`[ResMgr] Load Bundle Error: ${abName}, ${err.message}`);
                this.abBunds.set(abName, null as any);
                endFunc(false);
            } else {
                console.log(`[ResMgr] Load Bundle OK: ${abName}`);
                this.abBunds.set(abName, bundle);
                endFunc(true);
            }
        });
    }


    /**
     * 从已加载的AB包中加载资源
     */
    private loadAssetsInAssetsBundle(resPkg: PreloadConfig): void {
        for (const key in resPkg) {
            const bundle = this.abBunds.get(key);
            
            if (!bundle) {
                console.warn(`====>[ResMgr]: AB包 ${key} 加载失败，跳过该包资源加载`);
                continue;
            }

            // 预制体
            const urlSet = resPkg[key].urls || [];
            for (let i = 0; i < urlSet.length; i++) {
                this.loadRes(bundle, urlSet[i], Prefab, key);
            }

            // 音效
            const sounds = resPkg[key].sounds || [];
            for (let i = 0; i < sounds.length; i++) {
                this.loadRes(bundle, sounds[i], AudioClip, key);
            }

            // sprites
            const sprites = resPkg[key].sprites || [];
            for (let i = 0; i < sprites.length; i++) {
                this.loadRes(bundle, sprites[i], SpriteFrame, key);
            }
        }
    }


    /**
     * 加载单个资源
     * 使用 @ts-ignore 忽略类型检查，因为 Cocos Creator 3.8.5 的类型定义有冲突
     */
    private loadRes(
        abBundle: AssetManager.Bundle,
        url: string,
        typeClass: typeof Prefab | typeof AudioClip | typeof SpriteFrame,
        bundleName: string
    ): void {
        const cacheKey = `${bundleName}/${url}`;
        
        // 使用 any 类型绕过类型检查
        const bundle = abBundle as any;
        
        bundle.load(url, typeClass, (error: Error, asset: any) => {
            this.nowUrls++;

            if (error) {
                console.error(`====>[ResMgr]: 加载资源失败 ${cacheKey}, error: ${error.message}`);
            } else {
                // console.log(`====>[ResMgr]: 加载资源成功 ${cacheKey}`);
                this.loadedAssets.set(cacheKey, { asset, type: typeClass });
            }

            if (this.progressFun) {
                this.progressFun(this.nowUrls, this.totalUrls);
            }

            if (this.nowUrls === this.totalUrls && !this.isLoaded) {
                this.isLoaded = true;
                // console.log(`====>[ResMgr]: 所有资源加载完成!`);
                
                if (this.endFunc) {
                    this.endFunc();
                }
            }
        });
    }


    /**
     * 获取已加载的资源
     */
    public getAsset<T extends typeof Prefab | typeof AudioClip | typeof SpriteFrame>(
        abName: string,
        resPath: string,
        typeClass: T
    ): InstanceType<T> | null {
        // const bundle = assetManager.getBundle(abName);
        // if (!bundle) {
        //     console.error(`====>[ResMgr]: AB包 ${abName} 未加载!!!`);
        //     return null;
        // }
        // const asset = bundle.get(resPath, typeClass as any);
        
        // if (!asset) {
        //     console.error(`====>[ResMgr]: 资源 ${abName}/${resPath} 未找到!!!`);
        // }
        // return asset as InstanceType<T> | null;

        // 直接从缓存中取
        const cached = this.loadedAssets.get(`${abName}/${resPath}`);
        return cached?.asset as InstanceType<T> | null;
    }


    /**
     * 释放指定资源包的所有资源
     */
    public releaseResPackage(resPkg: PreloadConfig): void {
        for (const key in resPkg) {
            const urlSet = resPkg[key].urls || [];
            for (let i = 0; i < urlSet.length; i++) {
                const cacheKey = `${key}/${urlSet[i]}`;
                const cached = this.loadedAssets.get(cacheKey);
                
                if (cached) {
                    assetManager.releaseAsset(cached.asset);
                    this.loadedAssets.delete(cacheKey);
                    console.log(`====>[ResMgr]: 释放资源 ${cacheKey}`);
                }
            }

            const sounds = resPkg[key].sounds || [];
            for (let i = 0; i < sounds.length; i++) {
                const cacheKey = `${key}/${sounds[i]}`;
                const cached = this.loadedAssets.get(cacheKey);
                
                if (cached) {
                    assetManager.releaseAsset(cached.asset);
                    this.loadedAssets.delete(cacheKey);
                    console.log(`====>[ResMgr]: 释放资源 ${cacheKey}`);
                }
            }
        }
    }


    /**
     * 移除指定AB包
     */
    public removeBundle(abName: string): void {
        const bundle = assetManager.getBundle(abName);
        
        if (bundle) {
            for (const [key, value] of this.loadedAssets) {
                if (key.startsWith(`${abName}/`)) {
                    assetManager.releaseAsset(value.asset);
                    this.loadedAssets.delete(key);
                }
            }
            
            assetManager.removeBundle(bundle);
            this.abBunds.delete(abName);
            console.log(`====>[ResMgr]: 移除AB包 ${abName}`);
        } else {
            console.warn(`====>[ResMgr]: AB包 ${abName} 不存在，无需移除`);
        }
    }


    /**
     * 释放指定AB包内的所有资源（保留AB包）
     */
    public releaseAllResourcesInBundle(abName: string): void {
        const bundle = assetManager.getBundle(abName);
        
        if (bundle) {
            for (const [key, value] of this.loadedAssets) {
                if (key.startsWith(`${abName}/`)) {
                    assetManager.releaseAsset(value.asset);
                    this.loadedAssets.delete(key);
                }
            }
            
            bundle.releaseAll();
            console.log(`====>[ResMgr]: 释放AB包 ${abName} 内所有资源`);
        } else {
            console.warn(`====>[ResMgr]: AB包 ${abName} 不存在`);
        }
    }


    /**
     * 获取当前加载进度
     */
    public getProgress(): { loaded: number; total: number; percent: number } {
        return {
            loaded: this.nowUrls,
            total: this.totalUrls,
            percent: this.totalUrls > 0 ? this.nowUrls / this.totalUrls : 0
        };
    }


    /**
     * 检查是否正在加载中
     */
    public isLoading(): boolean {
        return this.nowUrls < this.totalUrls || this.nowAb < this.totalAb;
    }


    /**
     * 清空所有缓存
     */
    public clearAllCache(): void {
        for (const [key, value] of this.loadedAssets) {
            assetManager.releaseAsset(value.asset);
        }
        this.loadedAssets.clear();
        
        for (const [name, bundle] of this.abBunds) {
            if (bundle) {
                assetManager.removeBundle(bundle);
            }
        }
        this.abBunds.clear();
        
        this.resetState();
        
        console.log(`====>[ResMgr]: 清空所有缓存`);
    }


    /**
     * 清理并销毁管理器
     * @returns false 表示销毁失败，true 表示销毁成功
     */
    public cleanupAndDestroy(): boolean {
        this.clearAllCache();
        ResMgr.Instance = null;
        return this.node.destroy();
    }
}