-- MySQL Script generated by MySQL Workbench
-- Thu 21 Apr 2016 08:19:13 PM CST
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema test
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema test
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `test` DEFAULT CHARACTER SET utf8 ;
USE `test` ;

-- -----------------------------------------------------
-- Table `test`.`inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `test`.`inventory` (
  `book_id` INT NOT NULL,
  `isbn` VARCHAR(17) NULL,
  `name` VARCHAR(100) NULL,
  `press` VARCHAR(100) NULL,
  `author` VARCHAR(100) NULL,
  `retail_price` FLOAT(8,2) NULL,
  `count` INT NULL,
  `img_url` TEXT NULL,
  PRIMARY KEY (`book_id`),
  INDEX `isbn_index` (`isbn` ASC),
  INDEX `name_index` (`name` ASC),
  INDEX `press_index` (`press` ASC),
  INDEX `author_index` (`author` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `test`.`purchase_list`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `test`.`purchase_list` (
  `id` INT NOT NULL,
  `isbn` VARCHAR(17) NULL,
  `name` VARCHAR(100) NULL,
  `press` VARCHAR(100) NULL,
  `author` VARCHAR(100) NULL,
  `cost_price` FLOAT(8,2) NULL,
  `buying_count` INT NULL,
  `status` TEXT NULL,
  `create_time` DATETIME(0) NULL,
  `book_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `isbn_index` (`isbn` ASC),
  INDEX `name_index` (`name` ASC),
  INDEX `press_index` (`press` ASC),
  INDEX `author_index` (`author` ASC),
  INDEX `book_id_idx` (`book_id` ASC),
  CONSTRAINT `book_id`
    FOREIGN KEY (`book_id`)
    REFERENCES `test`.`inventory` (`book_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `test`.`bill`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `test`.`bill` (
  `buying_time` DATETIME(0) NOT NULL,
  `money` FLOAT(8,2) NULL,
  `book_id` INT NULL,
  `amount` INT NULL,
  `customer` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`buying_time`, `customer`),
  INDEX `id_idx` (`book_id` ASC),
  CONSTRAINT `book_id`
    FOREIGN KEY (`book_id`)
    REFERENCES `test`.`inventory` (`book_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `test`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `test`.`users` (
  `uid` INT NOT NULL,
  `username` VARCHAR(256) NULL,
  `passwd` VARCHAR(256) NULL,
  `realname` VARCHAR(256) NULL,
  `job_id` VARCHAR(6) NULL,
  `gender` VARCHAR(1) NULL,
  `age` SMALLINT(6) NULL,
  PRIMARY KEY (`uid`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
