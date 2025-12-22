pub mod constants;
pub mod store;

pub mod elements {
    pub mod effects {
        pub mod boost;
        pub mod chips;
        pub mod earn;
        pub mod explode;
        pub mod heal;
        pub mod immune;
        pub mod index;
        pub mod interface;
        pub mod lose;
        pub mod moonrock;
    }
    pub mod curses {
        pub mod demultiplier;
        pub mod double_draw;
        pub mod index;
        pub mod interface;
    }
    pub mod powers {
        pub mod burn;
        pub mod index;
        pub mod interface;
        pub mod reroll;
    }
}

pub mod models {
    pub mod config;
    pub mod game;
    pub mod index;
    pub mod pack;
    pub mod starterpack;
}

pub mod events {
    pub mod index;
}

pub mod types {
    pub mod curse;
    pub mod effect;
    pub mod image;
    pub mod metadata;
    pub mod milestone;
    pub mod orb;
    pub mod orbs;
    pub mod power;
    pub mod rarity;
}

pub mod helpers {
    pub mod bitmap;
    pub mod deck;
    pub mod dice;
    pub mod packer;
    pub mod power;
    pub mod random;
}

pub mod interfaces {
    pub mod erc20;
    pub mod registry;
    pub mod vrf;
}

pub mod components {
    pub mod playable;
    pub mod starterpack;
}

pub mod systems {
    pub mod collection;
    pub mod play;
    pub mod setup;
}

pub mod mocks {
    pub mod registry;
    pub mod token;
    pub mod vrf;
}

#[cfg(test)]
pub mod tests {
    pub mod setup;
    pub mod test_play;
    pub mod test_setup;
}
