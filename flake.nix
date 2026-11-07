{
  description = "Development Environment for this Project.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
  };

  outputs = { self, nixpkgs }:
  let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};

    nodejsSpecific = pkgs.stdenv.mkDerivation rec {
      pname = "nodejs";
      version = "22.23.4";

      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v${version}/node-v${version}-linux-x64.tar.xz";
        hash = "sha256-GAW8015oFVWb0uuX20ONP9sOs6XmqXe3wbrcp2M36c4=";
      };

      nativeBuildInputs = [ pkgs.autoPatchelfHook ];
      buildInputs = [ pkgs.stdenv.cc.cc.lib pkgs.zlib ];

      installPhase = ''
        runHook preInstall
        mkdir -p $out
        cp -r bin include lib share $out
        runHook postInstall
      '';
    };
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        pnpm_12
      ] ++ [nodejsSpecific];
    };
  };
}
