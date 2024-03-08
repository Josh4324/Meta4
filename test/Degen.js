const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Degen", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, user1, user2, user3, user4, user5] =
      await ethers.getSigners();

    const Degen = await ethers.getContractFactory("DegenToken");

    const degen = await Degen.deploy();

    return { degen, owner, user1, user2, user3, user4, user5 };
  }

  describe("Degen", function () {
    it("Only Degen Contract owner can mint token", async function () {
      const { degen, user1 } = await loadFixture(deploy);

      await degen.mint(user1.address, ethers.utils.parseEther("100"));
      async () => {
        expect.fail(
          await degen
            .connect(user1)
            .mint(user1.address, ethers.utils.parseEther("100"))
        );
      };

      expect(degen.balanceOf(user1.address) == ethers.utils.parseEther("100"));
    });

    it("Players can burn their token", async function () {
      const { degen, user1 } = await loadFixture(deploy);

      await degen.mint(user1.address, ethers.utils.parseEther("100"));
      await degen.connect(user1).burn(ethers.utils.parseEther("80"));

      expect(degen.balanceOf(user1.address) == ethers.utils.parseEther("20"));
    });

    it("Players can send token to other players", async function () {
      const { degen, user1, user2, user3, user4, owner } = await loadFixture(
        deploy
      );

      await degen.mint(user1.address, ethers.utils.parseEther("100"));
      await degen
        .connect(user1)
        .sendTokenToPlayer(user2.address, ethers.utils.parseEther("60"));

      expect(degen.balanceOf(user2.address) == ethers.utils.parseEther("60"));
    });

    it("Players can check their balance", async function () {
      const { degen, user1 } = await loadFixture(deploy);

      await degen.mint(user1.address, ethers.utils.parseEther("100"));

      expect(
        (await degen.checkBalance(user1.address)) ==
          ethers.utils.parseEther("100")
      );
    });

    it("Only Game contract owner can create InGame Items", async function () {
      const { degen, user1, user2, user3, user4, owner } = await loadFixture(
        deploy
      );

      await degen.createInGameItem("Item1", ethers.utils.parseEther("1"));
      async () => {
        expect.fail(
          await degen
            .connect(user1)
            .createInGameItem("Item1", ethers.utils.parseEther("1"))
        );
      };
    });

    it("Players can redeem in game items", async function () {
      const { degen, user1, user2, user3, user4, owner } = await loadFixture(
        deploy
      );

      await degen.mint(user1.address, ethers.utils.parseEther("100"));

      await degen.createInGameItem("Item1", ethers.utils.parseEther("1"));
      await degen.createInGameItem("Item2", ethers.utils.parseEther("2"));

      await degen.connect(user1).redeem(0);
      await degen.connect(user1).redeem(0);

      await degen.connect(user1).redeem(1);
      await degen.connect(user1).redeem(1);
      await degen.connect(user1).redeem(1);

      expect((await degen.connect(user1).gameItemBalance(0)) == 2);
      expect((await degen.connect(user1).gameItemBalance(1)) == 3);
    });
  });
});
