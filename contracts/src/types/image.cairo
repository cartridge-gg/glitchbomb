#[generate_trait]
pub impl Image of ImageTrait {
    fn get() -> ByteArray {
        "https://static.cartridge.gg/presets/glitch-bomb/icon.png"
    }
}
