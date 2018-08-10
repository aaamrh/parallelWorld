/*
Navicat MySQL Data Transfer

Source Server         : marh
Source Server Version : 50634
Source Host           : localhost:3308
Source Database       : demo1

Target Server Type    : MYSQL
Target Server Version : 50634
File Encoding         : 65001

Date: 2018-07-24 17:52:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for charts
-- ----------------------------
DROP TABLE IF EXISTS `charts`;
CREATE TABLE `charts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `tit` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of charts
-- ----------------------------
INSERT INTO `charts` VALUES ('11', 'pie', '');

-- ----------------------------
-- Table structure for inf
-- ----------------------------
DROP TABLE IF EXISTS `inf`;
CREATE TABLE `inf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `info_name` varchar(20) NOT NULL,
  `info_value` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of inf
-- ----------------------------
INSERT INTO `inf` VALUES ('1', 'blue', '25');
INSERT INTO `inf` VALUES ('2', 'red', '20');
INSERT INTO `inf` VALUES ('3', 'yellow', '35');
