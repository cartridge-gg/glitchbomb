use alexandria_encoding::base64::Base64ByteArrayEncoder;
use bundle::types::item::ItemTrait as BundleItemTrait;
use bundle::types::metadata::MetadataTrait as BundleMetadataTrait;
use collection::types::attribute::{Attribute, AttributeTrait};
use graffiti::json::JsonImpl;
use crate::types::image::Image;

#[generate_trait]
pub impl Metadata of MetadataTrait {
    #[inline]
    fn gen(
        name: ByteArray, description: ByteArray, game_id: u64, game_score: u32, game_over: bool,
    ) -> ByteArray {
        let attributes = array![
            Attribute { trait_type: "Game ID", value: format!("{}", game_id) }.jsonify(),
            Attribute { trait_type: "Game Score", value: format!("{}", game_score) }.jsonify(),
            Attribute { trait_type: "Game Over", value: format!("{}", game_over) }.jsonify(),
        ]
            .span();
        let metadata = JsonImpl::new()
            .add("name", format!("{} #{}", name, game_id))
            .add("description", description)
            .add(
                "image",
                "data:image/svg+xml;base64," + Base64ByteArrayEncoder::encode(Image::get()),
            )
            .add_array("attributes", attributes)
            .build();
        "data:application/json;base64," + Base64ByteArrayEncoder::encode(metadata)
    }

    #[inline]
    fn bundle(
        payment_tokens: Span<starknet::ContractAddress>, conditions: Span<ByteArray>,
    ) -> ByteArray {
        let item = BundleItemTrait::new(
            name: "Glitchbomb Game", description: "Glitchbomb", image_uri: Image::get(),
        );
        let metadata = BundleMetadataTrait::new(
            name: "Glitchbomb Games",
            description: "Glitchbomb games can be played on glitchbomb.xyz",
            image_uri: Image::get(),
            items: array![item].span(),
            tokens: payment_tokens,
            conditions: conditions,
        );
        metadata.jsonify()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metadata_gen() {
        let metadata = Metadata::gen("Test Game", "This is a test game", 1, 100, false);
        assert_eq!(metadata.len() > 0, true);
    }
}
