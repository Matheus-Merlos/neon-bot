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
      version = "26.12.1";

      src = pkgs.fetchurl {
        url = "https://nodejs.org/dist/v${version}/node-v${version}-linux-x64.tar.xz";
        hash = "sha256-YXCy1HThxib0PP863BGN+f47VzJYpPw9hQyNvGsHm70=";
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
