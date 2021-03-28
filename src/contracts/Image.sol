pragma solidity 0.5.16^;


contract Image{
  string imageHash;
  
  ///write function
  function set(string memory _imageHash) public {
    imageHash = _imageHash;
  }

  //read function
  function get() public view returns (string memory) {
    return imageHash;
  }
}

