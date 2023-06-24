export interface WavMakerOptions {
    /**
     * Frames per second of the imported clip
     *
     * @default 24
     */
    fps?: number,

    /**
     * Number of samples per second for the wav file, more samples = more resolution
     *
     * @default 41000
     */
    sampleRate?: number,

    /**
     * How fast a frame is drawn
     *
     * 1 is once per frame, 2 twice and so on
     *
     *
     * when drawing multiple times it will reduce flickering and create stronger lines, but it will reduce overall details,
     * to compensate increase {@link sampleRate} or use {@link multiplier} instead
     *
     * @default 1
     */
    frameSpeed?: number,

    /**
     * Save output wav to file
     *
     * @example
     *
     * "out/test.wav"
     */
    outPath?: string,

    /**
     * Value used to multiple {@link frameSpeed} and {@link sampleRate}
     */
    multiplier?: number
}