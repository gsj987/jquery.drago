describe('Drago', function () {
  describe('#drago', function () {
    var $textblock;

    beforeEach(function () {
      var i = 0;
      $textblock = $(document.createElement('div'))

      while (i < 3) {
        $textblock.append(document.createElement('p'));
        i += 1;
      }
    });

    it('should store each elements original width and height', function () {
      $textblock.find('p').drago().each(function(i, val) {
        expect($(this).data('drago').height).to.be.a('number');
        expect($(this).data('drago').width).to.be.a('number');
      });
    });

    it('should allow elements to be resizable by default', function () {
      $textblock.find('p').drago().each(function(i, val) {
        expect($(this).css('resize')).to.eql('both');
        expect($(this).css('overflow')).to.eql('hidden');
      });
    });

    it('should not make elements resizable', function () {
      $textblock.find('p').drago({ resize: false }).each(function(i, val) {
        expect($(this).css('resize')).not.to.eql('both');
        expect($(this).css('overflow')).not.to.eql('hidden');
      });
    });
  });
});
